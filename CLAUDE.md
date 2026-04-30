# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

GhostOps is a full-stack stealth Instagram account creation platform with two independent services that communicate via Next.js rewrites (same-origin cookie auth):

```
Browser → Next.js (port 3001) → [rewrite /auth /api /admin] → FastAPI (port 8000)
```

**Frontend**: `frontend/` — Next.js 16 + React 19 + Tailwind v4 + Framer Motion  
**Backend**: `backend/` — FastAPI + aiosqlite (SQLite WAL) + curl_cffi Chrome110 TLS fingerprinting  
**Process manager**: PM2 via `ecosystem.config.js` at repo root  
**DB**: `ghostops.db` written in `backend/` working dir (SQLite, auto-created on startup)

## Key Design Decisions

### Auth Flow
JWT is stored as an httpOnly cookie named `access_token` (7-day TTL). The frontend **never** touches the token directly — all auth is cookie-based. `credentials: 'include'` must be on every `fetch()` call in `frontend/lib/api.ts`. The Next.js rewrite proxy keeps browser and API on the same origin, eliminating CORS for cookies.

### Instagram Creation Pipeline (2-step)
1. `POST /api/instagram/create` — sends OTP email; stores session state in `ig_sessions` table with 15-min TTL; returns `session_id`
2. `POST /api/instagram/verify` — verifies OTP, runs full pipeline, **streams SSE events** (not JSON). Frontend reads this via `ReadableStream` / `parseSSEStream()` in `lib/api.ts`

SSE event format: `event: step|done|error\ndata: {...}\n\n`

### Proxy Resolution Order
When creating an IG account, the backend tries:
1. User's own active proxy (`user_proxies` table, least-fails first)  
2. Admin shared pool (`proxies` table)  
3. 503 if neither available

Proxies auto-retire after 3 fails (`MAX_PROXY_FAILS = 3`).

### Variable Font (Google Sans Flex)
The UI heavily uses the `wdth` and `wght` axes of Google Sans Flex. Framer Motion scroll transforms drive `fontVariationSettings` live on the Hero headline. Design tokens live entirely in `frontend/styles/tokens.css`; no hardcoded colours anywhere — always use `var(--color-*)`.

## Commands

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Dev server
uvicorn main:app --reload --port 8000

# Copy and edit env
cp .env.example .env
# Set JWT_SECRET (openssl rand -hex 32) and ADMIN_EMAIL
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # dev server on :3000
npm run build        # production build (output: standalone)
npm run start        # production server on :3001 (set PORT=3001)
npm run lint         # ESLint
```

### PM2 (production, run from repo root)
```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 logs              # tail all logs
pm2 status            # process status
pm2 restart all
pm2 stop all
```

The ecosystem config expects:
- Backend venv at `backend/venv/`
- Frontend standalone build at `frontend/.next/standalone/server.js`
- Logs dir at `logs/` (repo root)

## Environment Variables

**Backend** (`backend/.env`):
- `JWT_SECRET` — required; use `openssl rand -hex 32`
- `ADMIN_EMAIL` — auto-promoted to `is_admin=1` on first login
- `ALLOWED_ORIGINS` — comma-separated CORS origins (default: localhost:3000)
- `HTTPS_COOKIES` — `true` sets `Secure` flag on cookie (default: true)
- `COOKIE_SAMESITE` — `lax` or `none` (default: lax)

**Frontend** (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL` — leave empty `""` to use Next.js rewrites (recommended); only set for split-deploy

## Code Structure

```
backend/
  main.py              # FastAPI app, CORS, lifespan (init_db + session cleanup task)
  database.py          # All aiosqlite CRUD — single file, no ORM
  routers/
    auth.py            # /auth — register, login, logout, me; get_current_user dependency
    instagram.py       # /api/instagram — 2-step creation, SSE streaming, account listing
    proxy.py           # /api/proxy — user proxy CRUD + bulk add + live validation
    admin.py           # /admin — admin-only routes
  services/
    instagram_session.py  # InstagramSession class (curl_cffi Chrome110), check_proxy_live
    account_setup.py      # convert_to_professional(), update_bio() post-creation steps
  models/
    user.py            # Pydantic: UserCreate, UserLogin, UserOut, TokenData
    account.py         # Pydantic: CreateStep1Request, CreateStep2Request, IGAccountOut

frontend/
  app/                 # Next.js App Router pages
    page.tsx           # Landing: Nav + Hero + Features + HowItWorks + footer CTA
    layout.tsx         # Root layout — loads Google Sans Flex, wraps in AuthWrapper
    AuthWrapper.tsx    # Client component that provides AuthContext
    login/page.tsx
    register/page.tsx
    dashboard/page.tsx # Tabs: Accounts | My Proxies
    create/page.tsx    # 4-step wizard: email → otp → pipeline (SSE) → result
  components/
    Nav/Nav.tsx        # Floating pill nav (morphs on scroll via Framer layout)
    Hero/Hero.tsx      # Variable-font scroll animation, ambient grid, orb glow
    Features/          # 3-col card grid
    HowItWorks/        # 4-step horizontal flow
    CreateFlow/        # StepEmail, StepOTP, PipelineProgress, ResultCard
    Dashboard/         # AccountCard, ProxyManager, StatsBar
  lib/
    api.ts             # All API calls; parseSSEStream() async generator
    auth.tsx           # AuthContext + AuthProvider + useAuth() hook
  styles/
    tokens.css         # ALL design tokens (colours, spacing, font axes, easing)
    globals.css        # Component classes: .btn, .card, .input, .badge, .spinner
```

## Database Tables

| Table | Purpose |
|---|---|
| `users_site` | Platform users (bcrypt passwords, JWT auth) |
| `ig_accounts` | Created Instagram accounts (owner-scoped) |
| `ig_sessions` | 15-min OTP state between step 1 and step 2 |
| `proxies` | Admin-managed shared proxy pool |
| `user_proxies` | Per-user proxy pool (unique constraint: owner_id + proxy_url) |

## Styling Conventions

- All colours via `var(--color-*)` tokens — never hardcoded hex
- Spacing via `var(--sp-N)` (8px base scale)
- Typography classes: `.text-hero`, `.text-display`, `.text-headline`, `.text-label`
- Font variation: always set `fontVariationSettings: "'wdth' 100, 'wght' 700"` for bold headings
- Animations use Framer Motion; easing curves via `var(--ease-*)` tokens
- Responsive breakpoints: 1024px (tablet) and 640px/767px (mobile) — done with `<style jsx>` inline in components
