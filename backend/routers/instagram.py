"""
GhostOps — Instagram Router
Endpoints:
  POST /api/instagram/create   → Step 1: send OTP email
  POST /api/instagram/verify   → Step 2: verify OTP + run pipeline (SSE stream)
  GET  /api/instagram/accounts → List user's created accounts
  GET  /api/instagram/accounts/{id} → Single account

Proxy resolution order:
  1. User's own active proxy (user_proxies table)
  2. Admin shared proxy pool (proxies table)
  3. 503 — no proxy available
"""
import json
import asyncio
import logging
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from database import (
    # admin pool
    get_working_proxy, increment_proxy_fail, reset_proxy_fail,
    # user pool
    get_working_user_proxy, increment_user_proxy_fail, reset_user_proxy_fail,
    # sessions / accounts
    save_ig_session, get_ig_session, delete_ig_session,
    save_ig_account, get_accounts_by_owner, get_account_by_id,
)
from models.account import CreateStep1Request, CreateStep2Request, IGAccountOut
from routers.auth import get_current_user
from services.instagram_session import InstagramSession
from services.account_setup import convert_to_professional, update_bio

router = APIRouter()
logger = logging.getLogger("GhostOps.IGRouter")

# Max 5 concurrent creation operations
creation_semaphore = asyncio.Semaphore(5)


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def sse(event: str, data: dict) -> str:
    """Format a Server-Sent Event message."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def resolve_proxy(user_id: int):
    """
    Returns (proxy_url, source) where source is 'user' or 'admin'.
    User's own proxy takes priority; falls back to admin pool.
    """
    user_proxy = await get_working_user_proxy(user_id)
    if user_proxy:
        return user_proxy, "user"
    admin_proxy = await get_working_proxy()
    if admin_proxy:
        return admin_proxy, "admin"
    return None, None


async def handle_proxy_fail(proxy_url: str, source: str, user_id: int):
    if source == "user":
        await increment_user_proxy_fail(user_id, proxy_url)
    else:
        await increment_proxy_fail(proxy_url)


async def handle_proxy_success(proxy_url: str, source: str, user_id: int):
    if source == "user":
        await reset_user_proxy_fail(user_id, proxy_url)
    else:
        await reset_proxy_fail(proxy_url)


def _sse_origin(request: Request) -> str:
    """Return the correct Access-Control-Allow-Origin for SSE responses."""
    origin = request.headers.get("origin", "")
    allowed = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin in allowed:
        return origin
    return allowed[0] if allowed else "*"


# ─────────────────────────────────────────────
# POST /create  — Step 1
# ─────────────────────────────────────────────
@router.post("/instagram/create")
async def instagram_create(
    body: CreateStep1Request,
    current_user: dict = Depends(get_current_user),
):
    proxy, source = await resolve_proxy(current_user["id"])
    if not proxy:
        raise HTTPException(
            status_code=503,
            detail=(
                "No active proxies available. "
                "Add your own proxy in Dashboard → My Proxies, or contact admin."
            )
        )

    async with creation_semaphore:
        ig = InstagramSession(proxy)
        try:
            result = await ig.step_1_send_email(body.email)
        except Exception as e:
            logger.exception("Step 1 unhandled exception")
            await handle_proxy_fail(proxy, source, current_user["id"])
            raise HTTPException(status_code=500, detail=str(e))

    if not result["status"]:
        msg = result.get("msg", "")
        if any(kw in msg.lower() for kw in ["proxy", "banned", "connection"]):
            await handle_proxy_fail(proxy, source, current_user["id"])
        raise HTTPException(status_code=400, detail=msg)

    await handle_proxy_success(proxy, source, current_user["id"])

    # Serialise session state to DB (15-min TTL)
    context_json = json.dumps({
        "username": result["username"],
        "raw_password": result["raw_password"],
        "enc_password": result["enc_password"],
        "cookies": result["cookies"],
        "jazoest": result["jazoest"],
        "proxy": proxy,
        "proxy_source": source,
    })
    session_id = await save_ig_session(
        owner_id=current_user["id"],
        email=body.email,
        context_json=context_json,
    )

    return {
        "session_id": session_id,
        "email": body.email,
        "proxy_source": source,   # 'user' or 'admin' — informational
    }


# ─────────────────────────────────────────────
# POST /verify  — Step 2 (SSE stream)
# ─────────────────────────────────────────────
@router.post("/instagram/verify")
async def instagram_verify(
    body: CreateStep2Request,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    async def event_stream():
        # ── Retrieve session context ──────────────────────────────────
        ctx = await get_ig_session(body.session_id, current_user["id"])
        if not ctx:
            yield sse("error", {"msg": "Session expired or not found. Please restart."})
            return

        context_data = json.loads(ctx["context_json"])
        email = ctx["email"]

        # Re-use the same proxy + source that was used in step 1 so
        # the session cookies remain consistent. Fall back to fresh resolution.
        proxy = context_data.get("proxy")
        source = context_data.get("proxy_source", "admin")
        if not proxy:
            proxy, source = await resolve_proxy(current_user["id"])
        if not proxy:
            yield sse("error", {
                "msg": (
                    "No active proxies available. "
                    "Add your own proxy in Dashboard → My Proxies, or contact admin."
                )
            })
            return

        ig = InstagramSession(proxy)
        is_proxy_error = False

        async with creation_semaphore:
            # ── OTP VERIFICATION ──────────────────────────────────────
            yield sse("step", {
                "step": "otp_verify",
                "status": "running",
                "msg": "Verifying OTP with Instagram...",
            })

            try:
                result = await ig.step_2_verify_create(email, body.otp, context_data)
            except Exception as e:
                logger.exception("step_2_verify_create raised")
                is_proxy_error = True
                yield sse("step", {
                    "step": "otp_verify",
                    "status": "error",
                    "msg": f"Connection error: {str(e)}",
                })
                yield sse("error", {"msg": str(e)})
                await handle_proxy_fail(proxy, source, current_user["id"])
                return

            if not result["status"]:
                msg = result.get("msg", "Unknown error")
                if any(kw in msg.lower() for kw in ["proxy", "connection", "timeout"]):
                    is_proxy_error = True
                yield sse("step", {
                    "step": "otp_verify",
                    "status": "error",
                    "msg": msg,
                })
                yield sse("error", {"msg": msg})
                if is_proxy_error:
                    await handle_proxy_fail(proxy, source, current_user["id"])
                return

            yield sse("step", {
                "step": "otp_verify",
                "status": "done",
                "msg": "✅ OTP Verified",
            })

            await handle_proxy_success(proxy, source, current_user["id"])

            # ── ACCOUNT CREATED ───────────────────────────────────────
            yield sse("step", {
                "step": "account_create",
                "status": "done",
                "msg": "✅ Instagram Account Created",
            })

            cookies_dict = result.get("cookies_dict", {})
            csrf = cookies_dict.get("csrftoken", "")
            cookie_str = result["cookies"]
            username = result["username"]
            password = result["password"]

            # ── PROFESSIONAL CONVERSION ───────────────────────────────
            yield sse("step", {
                "step": "pro_convert",
                "status": "running",
                "msg": "Converting to Professional account...",
            })

            pro_result = await convert_to_professional(csrf, cookies_dict, ig.session)

            yield sse("step", {
                "step": "pro_convert",
                "status": "done" if pro_result["ok"] else "error",
                "msg": "✅ Professional Mode Enabled" if pro_result["ok"]
                       else f"⚠️ {pro_result.get('msg', 'Pro convert failed')}",
            })

            # ── BIO UPDATE ────────────────────────────────────────────
            yield sse("step", {
                "step": "bio_update",
                "status": "running",
                "msg": "Applying GhostOps bio...",
            })

            bio_result = await update_bio(csrf, cookies_dict, ig.session)

            yield sse("step", {
                "step": "bio_update",
                "status": "done" if bio_result["ok"] else "error",
                "msg": "✅ GhostOps Bio Applied" if bio_result["ok"]
                       else f"⚠️ {bio_result.get('msg', 'Bio update failed')}",
            })

            # ── PERSIST TO DB ─────────────────────────────────────────
            account_id = await save_ig_account(
                owner_id=current_user["id"],
                ig_username=username,
                ig_password=password,
                cookies=cookie_str,
                pro_converted=pro_result["ok"],
                bio_updated=bio_result["ok"],
            )

            await delete_ig_session(body.session_id)

            # ── DONE ──────────────────────────────────────────────────
            yield sse("done", {
                "account_id": account_id,
                "username": username,
                "password": password,
                "cookies": cookie_str,
                "pro_converted": pro_result["ok"],
                "bio_updated": bio_result["ok"],
            })

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": _sse_origin(request),
            "Access-Control-Allow-Credentials": "true",
        },
    )


# ─────────────────────────────────────────────
# GET /accounts  — List user's created accounts
# ─────────────────────────────────────────────
@router.get("/instagram/accounts")
async def list_accounts(current_user: dict = Depends(get_current_user)):
    accounts = await get_accounts_by_owner(current_user["id"])
    return [IGAccountOut(**a) for a in accounts]


# ─────────────────────────────────────────────
# GET /accounts/{id}  — Single account
# ─────────────────────────────────────────────
@router.get("/instagram/accounts/{account_id}")
async def get_account(
    account_id: int,
    current_user: dict = Depends(get_current_user),
):
    account = await get_account_by_id(account_id, current_user["id"])
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return IGAccountOut(**account)
