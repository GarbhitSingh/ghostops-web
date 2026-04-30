"""
GhostOps — Instagram Session Engine
Extracted from ghostops-ig (3).py — Telegram bot plumbing removed.
Bug fix applied: added `import time` (was missing in original, caused NameError).
"""
import re
import time
import base64
import asyncio
import logging
import random
import string
from typing import Optional, Dict, Any

import aiohttp
import rsa
from curl_cffi.requests import AsyncSession

logger = logging.getLogger("GhostOps.IGSession")

REQUEST_TIMEOUT = 30
PROXY_CHECK_TIMEOUT = 10


# ─────────────────────────────────────────────
# PROXY VALIDATION (used by admin router)
# ─────────────────────────────────────────────
async def check_proxy_live(proxy_url: str) -> bool:
    """Validate a proxy against Instagram's shared data endpoint."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://www.instagram.com/data/shared_data/",
                proxy=proxy_url,
                timeout=aiohttp.ClientTimeout(total=PROXY_CHECK_TIMEOUT),
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                  "AppleWebKit/537.36"
                }
            ) as resp:
                if resp.status == 200:
                    data = await resp.json(content_type=None)
                    return "config" in data
    except Exception:
        pass
    return False


# ─────────────────────────────────────────────
# INSTAGRAM SESSION
# ─────────────────────────────────────────────
class InstagramSession:
    """
    Stealth Instagram session using curl_cffi Chrome110 TLS fingerprint.
    Handles the complete 2-step account creation flow:
      step_1_send_email  →  serialise state  →  step_2_verify_create
    """

    def __init__(self, proxy: Optional[str] = None):
        self.proxy = proxy
        self.session = AsyncSession(impersonate="chrome110")
        if proxy:
            self.session.proxies = {"http": proxy, "https": proxy}

        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/110.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": "https://www.instagram.com",
            "Referer": "https://www.instagram.com/accounts/emailsignup/",
        })

        self.csrftoken: Optional[str] = None
        self.mid: Optional[str] = None
        self.public_key: Optional[str] = None
        self.key_id: Optional[str] = None
        self.jazoest: Optional[str] = None

    # ──────────────────────────────────────────
    # HANDSHAKE
    # ──────────────────────────────────────────
    async def fetch_initial_data(self):
        """
        Handshake with Instagram:
          1. Load signup page → extract CSRF + MID cookies + dynamic jazoest
          2. Sync encryption endpoint → fetch RSA public key + key_id
        """
        resp = await self.session.get(
            "https://www.instagram.com/accounts/emailsignup/"
        )
        if resp.status_code != 200:
            raise RuntimeError(f"Instagram signup page returned {resp.status_code}")

        self.csrftoken = self.session.cookies.get("csrftoken")
        self.mid = self.session.cookies.get("mid")
        if not self.csrftoken or not self.mid:
            raise RuntimeError("Session handshake failed — no CSRF/MID tokens")

        # Dynamic jazoest parsing
        match = re.search(r'name="jazoest"\s+value="(\d+)"', resp.text)
        if match:
            self.jazoest = match.group(1)
            logger.debug(f"jazoest (dynamic): {self.jazoest}")
        else:
            self.jazoest = "21906"
            logger.warning("jazoest not found in page, using fallback")

        # Encryption key sync
        key_resp = await self.session.get(
            "https://www.instagram.com/api/v1/web/qe/sync/"
        )
        if key_resp.status_code != 200:
            raise RuntimeError("Encryption sync endpoint returned non-200")
        data = key_resp.json()
        self.key_id = data.get("key_id")
        self.public_key = data.get("public_key")
        if not self.key_id or not self.public_key:
            raise RuntimeError("Public key missing from encryption sync response")

        self.session.headers.update({"x-csrftoken": self.csrftoken})

    # ──────────────────────────────────────────
    # PASSWORD ENCRYPTION
    # ──────────────────────────────────────────
    def encrypt_password(self, plain_password: str) -> str:
        """RSA-encrypt password using Instagram's web public key."""
        pub_key = rsa.PublicKey.load_pkcs1_openssl_pem(self.public_key.encode())
        encrypted = rsa.encrypt(plain_password.encode(), pub_key)
        b64_enc = base64.b64encode(encrypted).decode()
        # Format: #PWD_INSTAGRAM_BROWSER:0:{key_id}:{timestamp}:{b64_encrypted}
        return f"#PWD_INSTAGRAM_BROWSER:0:{self.key_id}:{int(time.time())}:{b64_enc}"

    # ──────────────────────────────────────────
    # STEP 1 — SEND OTP EMAIL
    # ──────────────────────────────────────────
    async def step_1_send_email(self, email: str) -> Dict[str, Any]:
        """
        Initiate account creation:
          - Dry-run to get username suggestion
          - Age verification
          - Send OTP email to target address
        Returns serialisable context dict (stored in ig_sessions, restored in step 2).
        """
        try:
            await self.fetch_initial_data()

            raw_password = "".join(
                random.choices(string.ascii_letters + string.digits + "#@!&", k=12)
            )
            enc_password = self.encrypt_password(raw_password)

            dry_run_data = {
                "enc_password": enc_password,
                "email": email,
                "first_name": "GhostOps User",
                "username": "",
                "client_id": self.mid,
                "seamless_login_enabled": "1",
                "opt_into_one_tap": "false",
                "jazoest": self.jazoest,
            }

            r1 = await self.session.post(
                "https://www.instagram.com/api/v1/web/accounts/web_create_ajax/attempt/",
                data=dry_run_data,
                timeout=REQUEST_TIMEOUT,
            )

            if r1.status_code in [403, 429]:
                return {"status": False, "msg": "Proxy banned by Instagram"}

            # Use suggested username if available, else derive from email
            username = email.split("@")[0] + str(random.randint(100, 999))
            try:
                suggestions = r1.json().get("username_suggestions", [])
                if suggestions:
                    username = suggestions[0]
            except Exception:
                pass

            dry_run_data["username"] = username
            await self.session.post(
                "https://www.instagram.com/api/v1/web/accounts/web_create_ajax/attempt/",
                data=dry_run_data,
                timeout=REQUEST_TIMEOUT,
            )

            await asyncio.sleep(random.uniform(2, 4))

            # Age verification
            await self.session.post(
                "https://www.instagram.com/api/v1/web/consent/check_age_eligibility/",
                data={"day": "15", "month": "4", "year": "2000", "jazoest": self.jazoest},
                timeout=REQUEST_TIMEOUT,
            )

            await asyncio.sleep(random.uniform(1, 3))

            # Send verification email
            r_email = await self.session.post(
                "https://www.instagram.com/api/v1/accounts/send_verify_email/",
                data={"device_id": self.mid, "email": email, "jazoest": self.jazoest},
                timeout=REQUEST_TIMEOUT,
            )

            if '"email_sent":true' in r_email.text:
                return {
                    "status": True,
                    "username": username,
                    "raw_password": raw_password,
                    "enc_password": enc_password,
                    "cookies": self.session.cookies.get_dict(),
                    "jazoest": self.jazoest,
                }
            else:
                return {"status": False, "msg": "Instagram blocked the email request"}

        except Exception as e:
            logger.exception("step_1_send_email error")
            return {"status": False, "msg": f"Internal error: {str(e)}"}

    # ──────────────────────────────────────────
    # STEP 2 — VERIFY OTP + CREATE ACCOUNT
    # ──────────────────────────────────────────
    async def step_2_verify_create(
        self,
        email: str,
        otp: str,
        context_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Complete account creation:
          - Restore session cookies from step 1 context
          - Verify OTP → extract signup_code
          - Final creation POST
        Returns: username, plaintext password, cookie string.
        """
        try:
            self.session.cookies.update(context_data["cookies"])
            self.mid = self.session.cookies.get("mid")
            self.csrftoken = self.session.cookies.get("csrftoken")
            if self.csrftoken:
                self.session.headers.update({"x-csrftoken": self.csrftoken})

            jazoest = context_data.get("jazoest", "21906")

            await asyncio.sleep(random.uniform(2, 4))

            # Verify OTP
            r_otp = await self.session.post(
                "https://www.instagram.com/api/v1/accounts/check_confirmation_code/",
                data={"code": otp, "device_id": self.mid, "email": email, "jazoest": jazoest},
                timeout=REQUEST_TIMEOUT,
            )

            if '"signup_code"' not in r_otp.text:
                return {"status": False, "msg": "Invalid or expired OTP"}

            try:
                signup_code = r_otp.json().get("signup_code")
            except Exception:
                return {"status": False, "msg": "Protocol error: no signup_code in response"}

            await asyncio.sleep(random.uniform(2, 5))

            # Final account creation
            r_create = await self.session.post(
                "https://www.instagram.com/api/v1/web/accounts/web_create_ajax/",
                data={
                    "enc_password": context_data["enc_password"],
                    "day": "15",
                    "month": "4",
                    "year": "2000",
                    "email": email,
                    "first_name": "GhostOps User",
                    "username": context_data["username"],
                    "client_id": self.mid,
                    "seamless_login_enabled": "1",
                    "force_sign_up_code": signup_code,
                    "jazoest": jazoest,
                },
                timeout=REQUEST_TIMEOUT,
            )

            if '"account_created":true' in r_create.text:
                final_cookies = self.session.cookies.get_dict()
                cookie_str = "; ".join(f"{k}={v}" for k, v in final_cookies.items())
                return {
                    "status": True,
                    "cookies": cookie_str,
                    "cookies_dict": final_cookies,
                    "username": context_data["username"],
                    "password": context_data["raw_password"],
                }
            else:
                try:
                    error_msg = r_create.json().get("message", r_create.text[:150])
                except Exception:
                    error_msg = r_create.text[:150]
                return {"status": False, "msg": f"Instagram rejected: {error_msg}"}

        except Exception as e:
            logger.exception("step_2_verify_create error")
            return {"status": False, "msg": f"Internal error: {str(e)}"}
