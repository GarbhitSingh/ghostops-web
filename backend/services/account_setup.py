"""
GhostOps — Account Setup Pipeline
Trimmed from insta_api.py:
  ✅ convert_to_professional()
  ✅ update_bio()
  ❌ change_profile_picture   — dropped
  ❌ create_post               — dropped
  ❌ link_shein_oauth          — dropped
  ❌ get_all_photos            — dropped

Bios updated to GhostOps promotional templates.
"""
import logging
import random
import asyncio
from typing import Dict, Any

from curl_cffi.requests import AsyncSession

logger = logging.getLogger("GhostOps.AccountSetup")

PC_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/110.0.0.0 Safari/537.36"
)
IG_APP_ID = "936619743392459"
PROF_APP_ID = "1217981644879628"

# ─────────────────────────────────────────────
# GHOSTOPS BIO TEMPLATES  (15 variants)
# ─────────────────────────────────────────────
BIO_TEMPLATES = [
    "🔥 GhostOps User 🔥\n⚡ Created via GhostOps\n🛡 Stealth IG Tools\n👻 ghostops.io",
    "👻 Powered by GhostOps\n🚀 Stealth. Speed. Scale.\n🔐 ghostops.io",
    "⚡ GhostOps Agent ⚡\n💀 Premium IG Automation\n🛡 ghostops.io",
    "🌑 Ghost in the Machine\n⚙️ Built on GhostOps\n🚀 ghostops.io",
    "💀 GhostOps Elite\n🔏 Encrypted. Anonymous.\n👁 ghostops.io",
    "🛡 Stealth Mode: ON\n⚡ GhostOps Certified\n🌐 ghostops.io",
    "👁 Watching from the Shadows\n🔥 GhostOps Powered\n🛡 ghostops.io",
    "🚀 Next-Level Automation\n💜 GhostOps Community\n👻 ghostops.io",
    "🌐 GhostOps Network\n⚡ Fast. Stealthy. Reliable.\n🔐 ghostops.io",
    "💎 GhostOps Premium\n🛡 Enterprise-Grade Stealth\n👻 ghostops.io",
    "🔮 Built Different\n⚙️ Powered by GhostOps Engine\n🌑 ghostops.io",
    "🌙 Silent Operator\n🔥 GhostOps IG Tool\n💀 ghostops.io",
    "⚡ Speed & Stealth\n🛡 GhostOps Automation\n🚀 ghostops.io",
    "🏴 Ghost Protocol Active\n💀 GhostOps Infrastructure\n🔐 ghostops.io",
    "👻 GhostOps User ✨\n⚡ Stealth IG Automation\n🌐 ghostops.io",
]


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def _base_headers(app_id: str = IG_APP_ID) -> Dict[str, str]:
    return {"user-agent": PC_UA, "x-ig-app-id": app_id}


# ─────────────────────────────────────────────
# PIPELINE STEP 1: CONVERT TO PROFESSIONAL
# ─────────────────────────────────────────────
async def convert_to_professional(
    csrf: str,
    cookies_dict: Dict[str, str],
    session: AsyncSession,
) -> Dict[str, Any]:
    """
    Convert a freshly created account to Instagram Professional/Business (type 3).
    Uses a random category to avoid patterns.
    3 retry attempts with 1.5s delay.
    """
    session.cookies.update(cookies_dict)
    url = "https://www.instagram.com/api/v1/business/account/convert_account/"
    headers = _base_headers(PROF_APP_ID)
    headers.update({
        "x-instagram-ajax": "1",
        "x-requested-with": "XMLHttpRequest",
        "x-csrftoken": csrf or session.cookies.get("csrftoken", ""),
        "referer": "https://www.instagram.com/accounts/edit/",
        "content-type": "application/x-www-form-urlencoded",
    })

    category_ids = ["180164648685982", "180410820992720", "180504230065143"]
    data = {
        "category_id": random.choice(category_ids),
        "create_business_id": "true",
        "entry_point": "ig_web_settings",
        "set_public": "true",
        "should_show_category": "0",
        "to_account_type": "3",
        "jazoest": "22663",
    }

    for attempt in range(3):
        try:
            r = await session.post(url, headers=headers, data=data, timeout=15)
            if r.status_code == 200 and "<!DOCTYPE html>" not in r.text:
                logger.info("✅ Professional conversion successful")
                return {"ok": True}
            logger.warning(f"Pro convert attempt {attempt + 1}: status {r.status_code}")
            await asyncio.sleep(1.5)
        except Exception as e:
            logger.warning(f"Pro convert attempt {attempt + 1} error: {e}")
            await asyncio.sleep(1.5)

    return {"ok": False, "msg": "Professional conversion failed after 3 attempts"}


# ─────────────────────────────────────────────
# PIPELINE STEP 2: UPDATE BIO
# ─────────────────────────────────────────────
async def update_bio(
    csrf: str,
    cookies_dict: Dict[str, str],
    session: AsyncSession,
) -> Dict[str, Any]:
    """
    Fetch current username then POST an updated profile with a random
    GhostOps promotional bio.
    3 retry attempts with 1.5s delay.
    """
    session.cookies.update(cookies_dict)
    active_csrf = csrf or session.cookies.get("csrftoken", "")

    # 1. Fetch current username
    info_headers = _base_headers()
    info_headers["x-csrftoken"] = active_csrf
    current_username = ""
    try:
        info_resp = await session.get(
            "https://www.instagram.com/api/v1/accounts/edit/web_form_data/",
            headers=info_headers,
            timeout=15,
        )
        current_username = info_resp.json().get("form_data", {}).get("username", "")
    except Exception as e:
        logger.warning(f"Could not fetch current username: {e}")

    # 2. POST updated profile
    edit_headers = info_headers.copy()
    edit_headers.update({
        "content-type": "application/x-www-form-urlencoded",
        "x-instagram-ajax": "1",
        "x-requested-with": "XMLHttpRequest",
    })

    data = {
        "biography": random.choice(BIO_TEMPLATES),
        "chaining_enabled": "on",
        "external_url": "",
        "first_name": "GhostOps User ✨",
        "username": current_username,
        "jazoest": "22689",
    }

    for attempt in range(3):
        try:
            r = await session.post(
                "https://www.instagram.com/api/v1/web/accounts/edit/",
                headers=edit_headers,
                data=data,
                timeout=15,
            )
            if r.status_code == 200:
                logger.info("✅ Bio update successful")
                return {"ok": True}
            logger.warning(f"Bio update attempt {attempt + 1}: status {r.status_code}")
            await asyncio.sleep(1.5)
        except Exception as e:
            logger.warning(f"Bio update attempt {attempt + 1} error: {e}")
            await asyncio.sleep(1.5)

    return {"ok": False, "msg": "Bio update failed after 3 attempts"}
