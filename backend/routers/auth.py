"""
GhostOps — Auth Router
JWT stored as httpOnly cookie (access_token, 7-day expiry).
"""
import os
from datetime import datetime, timedelta

from typing import Optional

from fastapi import APIRouter, HTTPException, Response, Request, Depends
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import create_user, get_user_by_email, get_user_by_id
from models.user import UserCreate, UserLogin, UserOut, TokenData

router = APIRouter()

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7
COOKIE_NAME = "access_token"

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def decode_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None


# ─────────────────────────────────────────────
# DEPENDENCY — get current user
# ─────────────────────────────────────────────
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────
@router.post("/register", response_model=UserOut)
async def register(body: UserCreate):
    # Check email uniqueness
    existing = await get_user_by_email(body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    pw_hash = hash_password(body.password)
    user_id = await create_user(body.username, body.email, pw_hash)
    user = await get_user_by_id(user_id)
    return UserOut(**user)


@router.post("/login")
async def login(body: UserLogin, response: Response):
    user = await get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user["id"])
    # SameSite=None + Secure is required for cross-origin (different subdomain) cookie delivery
    # when the frontend and backend are on different Cloudflare tunnel URLs.
    https_mode = os.getenv("HTTPS_COOKIES", "true").lower() == "true"
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=https_mode,
        samesite="none" if https_mode else "lax",
        max_age=JWT_EXPIRE_DAYS * 86400,
        path="/",
    )
    return UserOut(**user)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)
