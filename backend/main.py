"""
GhostOps Web — FastAPI Application Entry Point

Start dev server:
  uvicorn main:app --reload --port 8000
"""
import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db, cleanup_expired_sessions
from routers import auth, instagram, admin
from routers import proxy as proxy_router

load_dotenv()

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s [GhostOps] %(levelname)s — %(message)s",
    datefmt="%H:%M:%S",
    level=logging.INFO,
)

# ─────────────────────────────────────────────
# BACKGROUND TASKS
# ─────────────────────────────────────────────
async def session_cleanup_loop():
    """Purge expired ig_sessions every 5 minutes."""
    while True:
        await asyncio.sleep(300)
        await cleanup_expired_sessions()


# ─────────────────────────────────────────────
# LIFESPAN
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    asyncio.create_task(session_cleanup_loop())
    print(r"""
   ________  ______  ________________  ____  _____
  / ____/ / / / __ \/ ___/_  __/ __ \/ __ \/ ___/
 / / __/ /_/ / / / /\__ \ / / / / / / /_/ /\__ \
/ /_/ / __  / /_/ /___/ // / / /_/ / ____/___/ /
\____/_/ /_/\____//____//_/  \____/_/    /____/
        >> WEB EDITION — API ONLINE <<
    """)
    yield


# ─────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────
app = FastAPI(
    title="GhostOps API",
    description="Instagram stealth account creation platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow_credentials MUST be True for httpOnly cookie auth
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,   # ← MANDATORY for cookie-based auth
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ─────────────────────────────────────────────
# ROUTERS
# ─────────────────────────────────────────────
app.include_router(auth.router,         prefix="/auth",       tags=["Auth"])
app.include_router(instagram.router,    prefix="/api",        tags=["Instagram"])
app.include_router(admin.router,        prefix="/admin",      tags=["Admin"])
app.include_router(proxy_router.router, prefix="/api/proxy",  tags=["Proxy"])


@app.get("/health")
async def health():
    return {"status": "online", "service": "GhostOps API"}
