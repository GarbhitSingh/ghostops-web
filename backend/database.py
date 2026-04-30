"""
GhostOps — Async Database Engine
SQLite via aiosqlite with WAL mode for concurrent read performance.
"""
import uuid
import aiosqlite
from datetime import datetime, timedelta
from typing import Optional, Tuple, List, Dict, Any

DB_FILE = "ghostops.db"

# ─────────────────────────────────────────────
# INIT
# ─────────────────────────────────────────────
async def init_db():
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("PRAGMA foreign_keys=ON")

        # ── Website users ──
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users_site (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                username      TEXT    UNIQUE NOT NULL,
                email         TEXT    UNIQUE NOT NULL,
                password_hash TEXT    NOT NULL,
                is_admin      INTEGER DEFAULT 0,
                created_at    TEXT    NOT NULL
            )
        """)

        # ── Created Instagram accounts ──
        await db.execute("""
            CREATE TABLE IF NOT EXISTS ig_accounts (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id      INTEGER NOT NULL REFERENCES users_site(id),
                ig_username   TEXT    NOT NULL,
                ig_password   TEXT    NOT NULL,
                cookies       TEXT    NOT NULL,
                pro_converted INTEGER DEFAULT 0,
                bio_updated   INTEGER DEFAULT 0,
                created_at    TEXT    NOT NULL
            )
        """)

        # ── Temporary OTP session state (15-min TTL) ──
        await db.execute("""
            CREATE TABLE IF NOT EXISTS ig_sessions (
                session_id   TEXT PRIMARY KEY,
                owner_id     INTEGER NOT NULL REFERENCES users_site(id),
                email        TEXT    NOT NULL,
                context_json TEXT    NOT NULL,
                created_at   TEXT    NOT NULL,
                expires_at   TEXT    NOT NULL
            )
        """)

        # ── Admin proxy pool ──
        await db.execute("""
            CREATE TABLE IF NOT EXISTS proxies (
                proxy_url    TEXT PRIMARY KEY,
                status       TEXT NOT NULL DEFAULT 'active',
                fails        INTEGER NOT NULL DEFAULT 0,
                last_checked TEXT
            )
        """)
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_proxies_active ON proxies(status, fails)"
        )

        # ── Per-user proxy pool (each user can add their own proxies) ──
        await db.execute("""
            CREATE TABLE IF NOT EXISTS user_proxies (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id   INTEGER NOT NULL REFERENCES users_site(id),
                proxy_url  TEXT    NOT NULL,
                label      TEXT    DEFAULT '',
                status     TEXT    NOT NULL DEFAULT 'active',
                fails      INTEGER NOT NULL DEFAULT 0,
                added_at   TEXT    NOT NULL,
                UNIQUE(owner_id, proxy_url)
            )
        """)
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_user_proxies_active ON user_proxies(owner_id, status, fails)"
        )

        await db.commit()


# ─────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────
async def create_user(username: str, email: str, password_hash: str) -> int:
    async with aiosqlite.connect(DB_FILE) as db:
        cursor = await db.execute(
            "INSERT INTO users_site (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (username, email, password_hash, datetime.utcnow().isoformat())
        )
        await db.commit()
        return cursor.lastrowid


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_FILE) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users_site WHERE email = ?", (email,)
        ) as cursor:
            row = await cursor.fetchone()
    return dict(row) if row else None


async def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_FILE) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users_site WHERE id = ?", (user_id,)
        ) as cursor:
            row = await cursor.fetchone()
    return dict(row) if row else None


async def get_user_count() -> int:
    async with aiosqlite.connect(DB_FILE) as db:
        async with db.execute("SELECT COUNT(*) FROM users_site") as cursor:
            return (await cursor.fetchone())[0]


# ─────────────────────────────────────────────
# IG SESSIONS (OTP state, 15-min TTL)
# ─────────────────────────────────────────────
async def save_ig_session(owner_id: int, email: str, context_json: str) -> str:
    session_id = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute(
            "INSERT INTO ig_sessions VALUES (?, ?, ?, ?, ?, ?)",
            (session_id, owner_id, email, context_json,
             datetime.utcnow().isoformat(), expires_at)
        )
        await db.commit()
    return session_id


async def get_ig_session(session_id: str, owner_id: int) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_FILE) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM ig_sessions WHERE session_id = ? AND owner_id = ? AND expires_at > ?",
            (session_id, owner_id, datetime.utcnow().isoformat())
        ) as cursor:
            row = await cursor.fetchone()
    return dict(row) if row else None


async def delete_ig_session(session_id: str):
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute("DELETE FROM ig_sessions WHERE session_id = ?", (session_id,))
        await db.commit()


async def cleanup_expired_sessions():
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute(
            "DELETE FROM ig_sessions WHERE expires_at < ?",
            (datetime.utcnow().isoformat(),)
        )
        await db.commit()


# ─────────────────────────────────────────────
# IG ACCOUNTS
# ─────────────────────────────────────────────
async def save_ig_account(
    owner_id: int,
    ig_username: str,
    ig_password: str,
    cookies: str,
    pro_converted: bool,
    bio_updated: bool
) -> int:
    async with aiosqlite.connect(DB_FILE) as db:
        cursor = await db.execute(
            """INSERT INTO ig_accounts
               (owner_id, ig_username, ig_password, cookies, pro_converted, bio_updated, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (owner_id, ig_username, ig_password, cookies,
             int(pro_converted), int(bio_updated), datetime.utcnow().isoformat())
        )
        await db.commit()
        return cursor.lastrowid


async def get_accounts_by_owner(owner_id: int) -> List[Dict[str, Any]]:
    async with aiosqlite.connect(DB_FILE) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM ig_accounts WHERE owner_id = ? ORDER BY created_at DESC",
            (owner_id,)
        ) as cursor:
            rows = await cursor.fetchall()
    return [dict(r) for r in rows]


async def get_account_by_id(account_id: int, owner_id: int) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_FILE) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM ig_accounts WHERE id = ? AND owner_id = ?",
            (account_id, owner_id)
        ) as cursor:
            row = await cursor.fetchone()
    return dict(row) if row else None


async def get_account_count() -> int:
    async with aiosqlite.connect(DB_FILE) as db:
        async with db.execute("SELECT COUNT(*) FROM ig_accounts") as cursor:
            return (await cursor.fetchone())[0]


# ─────────────────────────────────────────────
# PROXIES  (original ghostops logic — kept verbatim)
# ─────────────────────────────────────────────
MAX_PROXY_FAILS = 3


async def add_valid_proxy(proxy_url: str):
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute(
            "INSERT OR REPLACE INTO proxies VALUES (?, 'active', 0, ?)",
            (proxy_url, datetime.utcnow().isoformat())
        )
        await db.commit()


async def clear_all_proxies():
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute("DELETE FROM proxies")
        await db.commit()


async def get_proxy_stats() -> Tuple[int, int, int]:
    async with aiosqlite.connect(DB_FILE) as db:
        async with db.execute("SELECT COUNT(*) FROM proxies") as c:
            total = (await c.fetchone())[0]
        async with db.execute("SELECT COUNT(*) FROM proxies WHERE status='active'") as c:
            active = (await c.fetchone())[0]
        async with db.execute("SELECT COUNT(*) FROM proxies WHERE status='dead'") as c:
            dead = (await c.fetchone())[0]
    return total, active, dead


async def get_working_proxy() -> Optional[str]:
    async with aiosqlite.connect(DB_FILE) as db:
        async with db.execute(
            "SELECT proxy_url FROM proxies WHERE status='active' ORDER BY fails ASC, RANDOM() LIMIT 1"
        ) as cursor:
            row = await cursor.fetchone()
    return row[0] if row else None


async def increment_proxy_fail(proxy_url: str):
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute(
            "UPDATE proxies SET fails = fails + 1 WHERE proxy_url = ?", (proxy_url,)
        )
        async with db.execute(
            "SELECT fails FROM proxies WHERE proxy_url = ?", (proxy_url,)
        ) as cursor:
            result = await cursor.fetchone()
            fails = result[0] if result else 0
        if fails >= MAX_PROXY_FAILS:
            await db.execute(
                "UPDATE proxies SET status='dead' WHERE proxy_url = ?", (proxy_url,)
            )
        await db.commit()


async def reset_proxy_fail(proxy_url: str):
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute(
            "UPDATE proxies SET fails = 0 WHERE proxy_url = ?", (proxy_url,)
        )
        await db.commit()


# ─────────────────────────────────────────────
# USER PROXIES  (per-user owned proxies)
# ─────────────────────────────────────────────
MAX_USER_PROXY_FAILS = 3


async def add_user_proxy(owner_id: int, proxy_url: str, label: str = "") -> Dict[str, Any]:
    """Add or update a proxy for a specific user."""
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute(
            """INSERT INTO user_proxies (owner_id, proxy_url, label, status, fails, added_at)
               VALUES (?, ?, ?, 'active', 0, ?)
               ON CONFLICT(owner_id, proxy_url)
               DO UPDATE SET label=excluded.label, status='active', fails=0, added_at=excluded.added_at""",
            (owner_id, proxy_url, label, datetime.utcnow().isoformat())
        )
        await db.commit()
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM user_proxies WHERE owner_id=? AND proxy_url=?",
            (owner_id, proxy_url)
        ) as cursor:
            row = await cursor.fetchone()
    return dict(row) if row else {}


async def get_user_proxies(owner_id: int) -> List[Dict[str, Any]]:
    """List all proxies belonging to a user."""
    async with aiosqlite.connect(DB_FILE) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM user_proxies WHERE owner_id=? ORDER BY added_at DESC",
            (owner_id,)
        ) as cursor:
            rows = await cursor.fetchall()
    return [dict(r) for r in rows]


async def delete_user_proxy(owner_id: int, proxy_id: int) -> bool:
    """Delete a user-owned proxy. Returns True if deleted."""
    async with aiosqlite.connect(DB_FILE) as db:
        cursor = await db.execute(
            "DELETE FROM user_proxies WHERE id=? AND owner_id=?",
            (proxy_id, owner_id)
        )
        await db.commit()
    return cursor.rowcount > 0


async def get_working_user_proxy(owner_id: int) -> Optional[str]:
    """Return the best active proxy for a specific user."""
    async with aiosqlite.connect(DB_FILE) as db:
        async with db.execute(
            """SELECT proxy_url FROM user_proxies
               WHERE owner_id=? AND status='active'
               ORDER BY fails ASC, RANDOM() LIMIT 1""",
            (owner_id,)
        ) as cursor:
            row = await cursor.fetchone()
    return row[0] if row else None


async def increment_user_proxy_fail(owner_id: int, proxy_url: str):
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute(
            "UPDATE user_proxies SET fails = fails + 1 WHERE owner_id=? AND proxy_url=?",
            (owner_id, proxy_url)
        )
        async with db.execute(
            "SELECT fails FROM user_proxies WHERE owner_id=? AND proxy_url=?",
            (owner_id, proxy_url)
        ) as cursor:
            result = await cursor.fetchone()
            fails = result[0] if result else 0
        if fails >= MAX_USER_PROXY_FAILS:
            await db.execute(
                "UPDATE user_proxies SET status='dead' WHERE owner_id=? AND proxy_url=?",
                (owner_id, proxy_url)
            )
        await db.commit()


async def reset_user_proxy_fail(owner_id: int, proxy_url: str):
    async with aiosqlite.connect(DB_FILE) as db:
        await db.execute(
            "UPDATE user_proxies SET fails=0 WHERE owner_id=? AND proxy_url=?",
            (owner_id, proxy_url)
        )
        await db.commit()


async def get_user_proxy_stats(owner_id: int) -> Tuple[int, int, int]:
    """Return (total, active, dead) proxy counts for a user."""
    async with aiosqlite.connect(DB_FILE) as db:
        async with db.execute(
            "SELECT COUNT(*) FROM user_proxies WHERE owner_id=?", (owner_id,)
        ) as c:
            total = (await c.fetchone())[0]
        async with db.execute(
            "SELECT COUNT(*) FROM user_proxies WHERE owner_id=? AND status='active'", (owner_id,)
        ) as c:
            active = (await c.fetchone())[0]
        async with db.execute(
            "SELECT COUNT(*) FROM user_proxies WHERE owner_id=? AND status='dead'", (owner_id,)
        ) as c:
            dead = (await c.fetchone())[0]
    return total, active, dead
