"""
GhostOps — User Proxy Router
Each authenticated user can manage their own proxy pool.
Admin's shared proxy pool is the fallback when a user has none.

Proxy URL format:
  http://username:password@host:port
  http://host:port
  socks5://username:password@host:port

Examples:
  http://user123:pass456@p.webshare.io:80
  http://12.34.56.78:8080
  socks5://myuser:mypass@proxy.example.com:1080
"""
import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from database import (
    add_user_proxy,
    get_user_proxies,
    delete_user_proxy,
    get_user_proxy_stats,
)
from routers.auth import get_current_user
from services.instagram_session import check_proxy_live

router = APIRouter()
logger = logging.getLogger("GhostOps.ProxyRouter")

PROXY_FORMAT_EXAMPLES = [
    "http://username:password@gate.dc.smartproxy.com:10000",
    "http://user123:pass456@p.webshare.io:80",
    "http://lum-customer-XXX:pass@zproxy.lum-superproxy.io:22225",
    "http://12.34.56.78:3128",
    "socks5://myuser:mypass@proxy.example.com:1080",
]

MAX_CONCURRENT_CHECKS = 10


class AddProxyRequest(BaseModel):
    proxy_url: str
    label: Optional[str] = ""
    validate_first: Optional[bool] = True


class BulkAddRequest(BaseModel):
    proxies: str              # newline-separated list
    validate_first: Optional[bool] = True


# ─────────────────────────────────────────────
# GET /proxy/examples
# ─────────────────────────────────────────────
@router.get("/examples")
async def proxy_examples():
    """Return proxy URL format examples and instructions."""
    return {
        "format": "http://username:password@host:port",
        "note": "HTTP and SOCKS5 proxies are supported. Authentication is optional for open proxies.",
        "examples": PROXY_FORMAT_EXAMPLES,
        "providers": [
            {"name": "Webshare",      "url": "https://webshare.io",        "format": "http://user:pass@p.webshare.io:80"},
            {"name": "Smartproxy",    "url": "https://smartproxy.com",     "format": "http://user:pass@gate.dc.smartproxy.com:10000"},
            {"name": "Bright Data",   "url": "https://brightdata.com",     "format": "http://lum-customer-XXX:pass@zproxy.lum-superproxy.io:22225"},
            {"name": "IPRoyal",       "url": "https://iproyal.com",        "format": "http://user:pass@geo.iproyal.com:12321"},
            {"name": "Open proxy",    "url": None,                         "format": "http://ip:port"},
        ],
    }


# ─────────────────────────────────────────────
# GET /proxy  — list user's proxies + stats
# ─────────────────────────────────────────────
@router.get("")
async def list_proxies(current_user: dict = Depends(get_current_user)):
    proxies = await get_user_proxies(current_user["id"])
    total, active, dead = await get_user_proxy_stats(current_user["id"])
    return {
        "proxies": proxies,
        "stats": {"total": total, "active": active, "dead": dead},
    }


# ─────────────────────────────────────────────
# POST /proxy  — add a single proxy
# ─────────────────────────────────────────────
@router.post("")
async def add_proxy(
    body: AddProxyRequest,
    current_user: dict = Depends(get_current_user),
):
    url = body.proxy_url.strip()
    if not (url.startswith("http") or url.startswith("socks")):
        raise HTTPException(
            status_code=400,
            detail="Invalid proxy URL. Must start with http:// or socks5://",
        )

    alive = True
    if body.validate_first:
        alive = await check_proxy_live(url)
        if not alive:
            raise HTTPException(
                status_code=422,
                detail="Proxy failed live check against Instagram. Verify your proxy credentials and format.",
            )

    proxy = await add_user_proxy(current_user["id"], url, body.label or "")
    logger.info(f"User {current_user['id']} added proxy: {url}")
    return {"proxy": proxy, "validated": body.validate_first, "alive": alive}


# ─────────────────────────────────────────────
# POST /proxy/bulk  — add many proxies at once
# ─────────────────────────────────────────────
@router.post("/bulk")
async def bulk_add_proxies(
    body: BulkAddRequest,
    current_user: dict = Depends(get_current_user),
):
    lines = body.proxies.splitlines()
    urls = [
        line.strip() for line in lines
        if line.strip() and (line.strip().startswith("http") or line.strip().startswith("socks"))
    ]

    if not urls:
        raise HTTPException(status_code=400, detail="No valid proxy lines found.")

    if body.validate_first:
        sem = asyncio.Semaphore(MAX_CONCURRENT_CHECKS)

        async def validate(url: str):
            async with sem:
                return url, await check_proxy_live(url)

        results = await asyncio.gather(*[validate(u) for u in urls])
        live_urls = [u for u, alive in results if alive]
    else:
        live_urls = urls

    added = 0
    for url in live_urls:
        await add_user_proxy(current_user["id"], url, "")
        added += 1

    logger.info(f"User {current_user['id']} bulk-added proxies: {added}/{len(urls)} live")
    return {
        "submitted": len(urls),
        "added": added,
        "skipped": len(urls) - added,
        "validate_first": body.validate_first,
    }


# ─────────────────────────────────────────────
# DELETE /proxy/{proxy_id}
# ─────────────────────────────────────────────
@router.delete("/{proxy_id}")
async def remove_proxy(
    proxy_id: int,
    current_user: dict = Depends(get_current_user),
):
    deleted = await delete_user_proxy(current_user["id"], proxy_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Proxy not found or not yours")
    return {"detail": "Proxy removed"}
