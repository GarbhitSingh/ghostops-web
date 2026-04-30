"""
GhostOps — Admin Router
Proxy management + platform stats.
All routes require is_admin = True.
"""
import asyncio
import logging
from fastapi import APIRouter, Depends, Request

from database import (
    add_valid_proxy, clear_all_proxies, get_proxy_stats,
    get_user_count, get_account_count,
)
from routers.auth import get_admin_user
from services.instagram_session import check_proxy_live

MAX_PROXY_CHECKS = 20
router = APIRouter()
logger = logging.getLogger("GhostOps.Admin")


@router.post("/proxies")
async def inject_proxies(request: Request, _: dict = Depends(get_admin_user)):
    """
    Accept a plain-text proxy list (one per line, http://user:pass@ip:port format).
    Validates each concurrently against Instagram then stores live ones.
    """
    body = await request.body()
    lines = body.decode().splitlines()
    proxies = [p.strip() for p in lines if p.strip().startswith("http")]

    if not proxies:
        return {"detail": "No valid proxy lines found", "added": 0}

    sem = asyncio.Semaphore(MAX_PROXY_CHECKS)

    async def validate(p: str):
        async with sem:
            return p, await check_proxy_live(p)

    results = await asyncio.gather(*[validate(p) for p in proxies])
    added = 0
    for proxy, alive in results:
        if alive:
            await add_valid_proxy(proxy)
            added += 1

    logger.info(f"Admin injected proxies: {added}/{len(proxies)} live")
    return {"total": len(proxies), "added": added}


@router.delete("/proxies")
async def flush_proxies(_: dict = Depends(get_admin_user)):
    await clear_all_proxies()
    return {"detail": "All proxies flushed"}


@router.get("/stats")
async def get_stats(_: dict = Depends(get_admin_user)):
    total_proxies, active_proxies, dead_proxies = await get_proxy_stats()
    return {
        "users": await get_user_count(),
        "ig_accounts": await get_account_count(),
        "proxies": {
            "total": total_proxies,
            "active": active_proxies,
            "dead": dead_proxies,
        },
    }
