<div align="center">

<br/>

# 👻 GhostOps Web

### *The stealth infrastructure for Instagram account automation*

<br/>

![GhostOps Banner](https://img.shields.io/badge/GhostOps-Web%20Edition-3279F9?style=for-the-badge&logo=ghost&logoColor=white)
&nbsp;
![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white)
&nbsp;
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
&nbsp;
![Python](https://img.shields.io/badge/Python%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white)

<br/>

> **GhostOps** transforms the original Telegram bot into a full production‑grade web platform — with an [antigravity.google](https://antigravity.google)‑level cinematic GUI, real‑time pipeline streaming, secure user accounts, and a personal credential dashboard.

<br/>

---

</div>

## 📖 Table of Contents

- [✨ What is GhostOps?](#-what-is-ghostops)
- [🎬 How It Works](#-how-it-works)
- [🖥️ Feature Breakdown](#️-feature-breakdown)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [⚙️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the repo](#1-clone-the-repo)
  - [2. Backend setup](#2-backend-setup)
  - [3. Frontend setup](#3-frontend-setup)
  - [4. Docker (recommended)](#4-docker-recommended)
- [🔑 Environment Variables](#-environment-variables)
- [🌐 API Reference](#-api-reference)
- [🎨 Design System](#-design-system)
- [🛡️ Admin Panel](#️-admin-panel)
- [🔍 Under the Hood](#-under-the-hood)
- [📦 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

---

## ✨ What is GhostOps?

**GhostOps** is a premium web platform that automates Instagram account creation and setup — entirely through your browser. No Telegram bot, no command line, no technical knowledge required.

You visit the website, log in, enter an email address, drop in the OTP Instagram sends you, and **watch the pipeline run in real time**. Seconds later you have:

- ✅ A freshly created Instagram account
- ✅ Automatically converted to **Professional / Business** mode
- ✅ Bio set to a **GhostOps-branded** template
- ✅ Full credentials (username, password, session cookies) ready to copy or download

Every account you create is saved to your **personal dashboard** — accessible any time.

---

## 🎬 How It Works

```
You                    GhostOps Web              Instagram API
 │                          │                          │
 │── Enter email ──────────▶│                          │
 │                          │── Chrome 110 handshake ─▶│
 │                          │◀─ CSRF + MID + RSA key ──│
 │                          │── Dry run (username) ───▶│
 │                          │── Age verification ─────▶│
 │                          │── Send verify email ────▶│
 │◀── session_id ───────────│                          │
 │                          │                        📧 OTP arrives in inbox
 │── Enter OTP ────────────▶│                          │
 │                          │── Verify OTP ───────────▶│
 │                          │◀─ signup_code ───────────│
 │                          │── Create account ───────▶│
 │                          │◀─ ✅ account_created ────│
 │◀── SSE: "Account Created"│                          │
 │                          │── Convert to Pro ───────▶│
 │◀── SSE: "Pro Mode ON" ───│                          │
 │                          │── Update bio ───────────▶│
 │◀── SSE: "Bio Applied" ───│                          │
 │◀── Credentials card ─────│                          │
```

Every step above streams **live to your browser** via Server-Sent Events — you watch each ✅ tick in real time as the pipeline progresses.

---

## 🖥️ Feature Breakdown

### 👻 Stealth Account Creation
| Feature | Detail |
|---|---|
| **TLS Impersonation** | `curl_cffi` Chrome 110 fingerprint — Instagram sees a real browser |
| **Dynamic Jazoest** | Parsed directly from the Instagram signup page HTML on every request |
| **RSA Password Encryption** | Instagram's public key is fetched live and used to encrypt passwords before transmission |
| **Human Timing** | Random delays (`2–5s`) between API calls to avoid rate-limit pattern detection |
| **Username Suggestion** | Automatically picks from Instagram's own username suggestions |
| **OTP Flow** | Full 2-step: email send → OTP verify → signup code extraction → final creation |

### 🔄 Proxy Engine
| Feature | Detail |
|---|---|
| **Bulk Injection** | Admin pastes a proxy list — all validated concurrently (20 parallel checks) |
| **Live Validation** | Each proxy tested against Instagram's `/data/shared_data/` endpoint before storing |
| **Auto-Rotation** | Picks the least-failed active proxy for every creation request |
| **Kill Switch** | After 3 consecutive failures, a proxy is automatically marked `dead` |
| **Smart Penalisation** | Only connection-level errors penalise a proxy — Instagram auth rejections don't |

### ⚡ Real-time Pipeline (SSE)
Every step of the account setup streams live to the frontend:
```
🔄 Verifying OTP with Instagram...
✅ OTP Verified
✅ Instagram Account Created
🔄 Converting to Professional account...
✅ Professional Mode Enabled
🔄 Applying GhostOps bio...
✅ GhostOps Bio Applied
🎉 Done — credentials ready
```

### 💼 Professional Account Setup
- Converts to Instagram **Business/Creator** (account type 3)
- Uses a random **category ID** from 3 options to vary the pattern
- 3-retry loop with 1.5s backoff — resilient against transient failures

### ✍️ GhostOps Bio Templates
15 branded bio templates, one picked at random per account. Examples:
```
🔥 GhostOps User 🔥
⚡ Created via GhostOps
🛡 Stealth IG Tools
👻 ghostops.io
```
```
👻 Powered by GhostOps
🚀 Stealth. Speed. Scale.
🔐 ghostops.io
```

### 📋 Credential Dashboard
- All created accounts saved to your account permanently
- **Copy** username, password, or cookies individually with one click
- **Password masking** (toggle show/hide)
- **Download `.txt`** — formatted credential file with pipeline status
- **Stats bar** — total accounts, professional conversions, bio updates, success rate

### 🔐 Auth System
- Email + password registration
- JWT stored as **httpOnly cookie** (7-day expiry) — never exposed to JavaScript
- Protected routes via **Next.js Edge Middleware**
- Admin accounts with elevated permissions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Next.js 14)                      │
│                                                                   │
│  Landing  →  Register/Login  →  /create  →  /dashboard          │
│                                    │                              │
│              StepEmail → StepOTP → PipelineProgress → ResultCard │
│                              │                                    │
│                         SSE Stream                                │
└──────────────────────────────┼──────────────────────────────────┘
                               │ fetch + ReadableStream
                               │ credentials: 'include'
┌──────────────────────────────▼──────────────────────────────────┐
│                      FASTAPI BACKEND (Python)                     │
│                                                                   │
│  /auth/*     JWT cookie auth (register, login, logout, /me)      │
│  /api/instagram/create     Step 1 — send OTP email               │
│  /api/instagram/verify     Step 2 — SSE streaming pipeline       │
│  /api/instagram/accounts   CRUD for saved accounts               │
│  /admin/*    Proxy injection, flush, stats                        │
│                                                                   │
│  ┌─────────────────┐   ┌────────────────────────────────────┐   │
│  │ InstagramSession│   │ AccountSetup Pipeline               │   │
│  │ (curl_cffi)     │   │ convert_to_professional()           │   │
│  │ Chrome 110 TLS  │   │ update_bio()                        │   │
│  └─────────────────┘   └────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ SQLite (aiosqlite, WAL mode)                            │    │
│  │  users_site │ ig_accounts │ ig_sessions │ proxies       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ghostops-web/
│
├── 🐍 backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── database.py                  # SQLite schema + all async queries
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   │
│   ├── routers/
│   │   ├── auth.py                  # JWT cookie auth endpoints
│   │   ├── instagram.py             # Account creation + SSE stream
│   │   └── admin.py                 # Proxy management + stats
│   │
│   ├── services/
│   │   ├── instagram_session.py     # Instagram handshake + 2-step creation
│   │   └── account_setup.py        # Professional conversion + bio update
│   │
│   └── models/
│       ├── user.py                  # Pydantic user models
│       └── account.py              # Pydantic account models
│
├── ⚛️  frontend/
│   ├── app/
│   │   ├── layout.tsx               # Root layout + Google Sans Flex font
│   │   ├── page.tsx                 # Landing page (Hero + Features + HowItWorks)
│   │   ├── AuthWrapper.tsx          # Client-side auth context provider
│   │   ├── login/page.tsx           # Login page
│   │   ├── register/page.tsx        # Register page
│   │   ├── create/page.tsx          # Account creation — 4-step state machine
│   │   └── dashboard/page.tsx       # User dashboard
│   │
│   ├── components/
│   │   ├── Nav/Nav.tsx              # Frosted glass pill nav (morphs on scroll)
│   │   ├── Hero/Hero.tsx            # Variable font scroll animation hero
│   │   ├── Features/Features.tsx    # 6-card feature grid
│   │   ├── HowItWorks/             # 4-step visual flow
│   │   ├── CreateFlow/
│   │   │   ├── StepEmail.tsx        # Email input
│   │   │   ├── StepOTP.tsx          # OTP input + SSE stream consumer
│   │   │   ├── PipelineProgress.tsx # Live animated pipeline timeline
│   │   │   └── ResultCard.tsx       # Credentials + copy + download
│   │   └── Dashboard/
│   │       ├── StatsBar.tsx         # Aggregate stats
│   │       └── AccountCard.tsx      # Per-account credential card
│   │
│   ├── lib/
│   │   ├── api.ts                   # Typed API client (credentials: include)
│   │   └── auth.ts                  # AuthContext + useAuth hook + AuthProvider
│   │
│   ├── middleware.ts                # Edge route protection
│   ├── styles/
│   │   ├── tokens.css               # Full design token system
│   │   └── globals.css              # Base styles + component classes
│   └── Dockerfile
│
└── 🐳 docker-compose.yml
```

---

## ⚙️ Tech Stack

### Backend
| Technology | Version | Role |
|---|---|---|
| **FastAPI** | 0.115 | Async REST API + SSE streaming |
| **Python** | 3.11 | Runtime |
| **curl_cffi** | 0.7.4 | Chrome TLS impersonation |
| **aiosqlite** | 0.20 | Async SQLite database |
| **python-jose** | 3.3 | JWT generation + validation |
| **passlib[bcrypt]** | 1.7 | Password hashing |
| **rsa** | 4.9 | Instagram password RSA encryption |
| **aiohttp** | 3.11 | Async proxy validation |
| **python-dotenv** | 1.0 | Environment variable loading |
| **pydantic** | 2.10 | Request/response validation |

### Frontend
| Technology | Version | Role |
|---|---|---|
| **Next.js** | 14 (App Router) | React framework + SSR |
| **TypeScript** | 5 | Type safety |
| **Framer Motion** | latest | Animations (spring, layout, scroll) |
| **Google Sans Flex** | — | Variable font (wdth + wght + ROND axes) |
| **CSS Custom Properties** | — | Design token system |
| **Tailwind CSS** | 3 | Utility classes |

### Infrastructure
| Technology | Role |
|---|---|
| **Docker + Compose** | Containerised deployment |
| **SQLite (WAL mode)** | Embedded database with concurrent read support |
| **Server-Sent Events** | Real-time pipeline progress streaming |
| **httpOnly JWT Cookie** | Secure cross-origin authentication |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.11
- **pip**
- **Git**
- *(Optional)* **Docker + Docker Compose**

---

### 1. Clone the repo

```bash
git clone https://github.com/GarbhitSingh/ghostops-web.git
cd ghostops-web
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set JWT_SECRET and ADMIN_EMAIL

# Start the server
uvicorn main:app --reload --port 8000
```

> ✅ Backend available at `http://localhost:8000`
> 📚 Auto-generated API docs at `http://localhost:8000/docs`

---

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

> ✅ Frontend available at `http://localhost:3000`

---

### 4. Docker (recommended)

The fastest way to run the full stack:

```bash
# In the project root (ghostops-web/)
cp backend/.env.example backend/.env
# Edit backend/.env — at minimum set JWT_SECRET

docker compose up --build
```

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| ⚡ Backend API | http://localhost:8000 |
| 📚 API Docs | http://localhost:8000/docs |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | ✅ | — | JWT signing key — use `openssl rand -hex 32` |
| `ADMIN_EMAIL` | ✅ | — | Email of the admin user account |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:3000` | Comma-separated CORS origins |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:8000` | FastAPI backend URL |

---

## 🌐 API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{username, email, password}` | Create new user account |
| `POST` | `/auth/login` | `{email, password}` | Login — sets httpOnly cookie |
| `POST` | `/auth/logout` | — | Clear auth cookie |
| `GET` | `/auth/me` | — | Get current user info |

### Instagram

| Method | Endpoint | Body / Response | Description |
|---|---|---|---|
| `POST` | `/api/instagram/create` | `{email}` → `{session_id}` | Step 1 — send OTP to email |
| `POST` | `/api/instagram/verify` | `{session_id, otp}` → **SSE stream** | Step 2 — verify + run pipeline |
| `GET` | `/api/instagram/accounts` | — → `IGAccount[]` | List all your created accounts |
| `GET` | `/api/instagram/accounts/{id}` | — → `IGAccount` | Single account details |

### Admin *(requires admin account)*

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/admin/proxies` | Plain-text proxy list | Bulk inject + validate proxies |
| `DELETE` | `/admin/proxies` | — | Flush all proxies |
| `GET` | `/admin/stats` | — | Users, accounts, proxy health |

### SSE Event Format (`/api/instagram/verify`)

```
event: step
data: {"step": "otp_verify", "status": "running", "msg": "Verifying OTP..."}

event: step
data: {"step": "otp_verify", "status": "done", "msg": "✅ OTP Verified"}

event: step
data: {"step": "account_create", "status": "done", "msg": "✅ Account Created"}

event: step
data: {"step": "pro_convert", "status": "running", "msg": "Converting to Professional..."}

event: step
data: {"step": "pro_convert", "status": "done", "msg": "✅ Professional Mode Enabled"}

event: step
data: {"step": "bio_update", "status": "running", "msg": "Applying GhostOps Bio..."}

event: step
data: {"step": "bio_update", "status": "done", "msg": "✅ GhostOps Bio Applied"}

event: done
data: {"username": "...", "password": "...", "cookies": "...", "account_id": 42}
```

---

## 🎨 Design System

GhostOps uses the same design language as [antigravity.google](https://antigravity.google):

### Colour Tokens
| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#121317` | Page background |
| `--color-surface` | `#1a1d24` | Card surfaces |
| `--color-surface-2` | `#21252f` | Elevated cards / hover states |
| `--color-accent` | `#3279F9` | CTAs only — never decorative |
| `--color-success` | `#34d399` | Pipeline done / badges |
| `--color-error` | `#f87171` | Errors / failed steps |

### Typography
- **Google Sans Flex** — variable font with `wdth` (75→150), `wght` (100→700), `ROND` (0→100) axes
- Hero headlines animate their variable font axes on scroll — condensed+bold at top, expanded+light when scrolled
- 9-level type scale from `12px` (labels) to `128px` (hero)

### Key Animations
| Effect | Implementation |
|---|---|
| Nav → pill morph | Framer Motion `layout` prop on scroll |
| Hero variable font | `useScroll` + `useTransform` → `font-variation-settings` |
| Card entrances | `useInView` + staggered `opacity/y` |
| Pipeline steps | `AnimatePresence` + `x:-20 → x:0` slide-in |
| Pipeline done dot | Spring scale `0 → 1` with `stiffness:400` |
| Buttons | `cubic-bezier(0.34, 1.85, 0.64, 1)` springy hover |

---

## 🛡️ Admin Panel

Access the admin features by:

1. Register with the email set in `ADMIN_EMAIL` env var
2. Use the `/admin/*` API endpoints

**Proxy injection:**
```bash
curl -b cookies.txt -X POST http://localhost:8000/admin/proxies \
  -H "Content-Type: text/plain" \
  --data-binary @proxies.txt
```

Where `proxies.txt` contains one proxy per line:
```
http://user:pass@1.2.3.4:8080
http://user:pass@5.6.7.8:3128
```

**View stats:**
```bash
curl -b cookies.txt http://localhost:8000/admin/stats
# → {"users": 12, "ig_accounts": 47, "proxies": {"total": 20, "active": 18, "dead": 2}}
```

---

## 🔍 Under the Hood

### Why `fetch` + `ReadableStream` instead of `EventSource`?

The `/api/instagram/verify` endpoint streams SSE. We use raw `fetch` instead of the browser's native `EventSource` because:

1. `EventSource` only supports **GET** requests — we need `POST` (to send `session_id` + `otp`)
2. `EventSource` doesn't support `credentials: 'include'` for cross-origin httpOnly cookies
3. Raw `fetch` + `ReadableStream` gives us full control over headers, body, and auth

### Why SQLite and not PostgreSQL?

SQLite with **WAL (Write-Ahead Logging)** mode handles the expected concurrency perfectly:
- Concurrent reads don't block each other
- Writes serialise (fine for this use case — not a high-throughput write system)
- Zero infrastructure overhead — the DB is a single file
- Easy backup: just copy `ghostops.db`

### The `import time` bug in the original code

The original `ghostops-ig (3).py` calls `int(time.time())` inside `encrypt_password()` but never imports `time`. This would raise `NameError` at runtime — it worked in the Telegram bot only because `encrypt_password` was never actually called in the version tested. Fixed in `services/instagram_session.py`.

### Session state between Step 1 and Step 2

Instagram's `curl_cffi` session object holds live cookies that can't be pickled or serialised directly. Solution:

1. **Step 1** (`/create`): Extract just the cookie dict + scalar values → serialise to JSON → store in `ig_sessions` table (15-min TTL)
2. **Step 2** (`/verify`): Reconstruct a fresh `AsyncSession` → replay `session.cookies.update(context_data['cookies'])` → continues seamlessly

This is exactly what the original code already did in its Telegram handler — we preserved that pattern.

---

## 📦 Deployment

### Vercel (Frontend) + Railway/Render (Backend)

**Frontend → Vercel:**
```bash
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Backend → Railway:**
```bash
# In backend/
railway init
railway up
# Set env vars: JWT_SECRET, ADMIN_EMAIL, ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

**Important for production:**
- Set `samesite="none"` + `secure=True` in `routers/auth.py` `set_cookie` call (currently `samesite="lax"` for dev)
- Update `ALLOWED_ORIGINS` to your production frontend domain
- Use a strong `JWT_SECRET` (`openssl rand -hex 32`)

### VPS (Docker)
```bash
git clone https://github.com/GarbhitSingh/ghostops-web.git
cd ghostops-web
echo "JWT_SECRET=$(openssl rand -hex 32)" >> backend/.env
echo "ADMIN_EMAIL=admin@yourdomain.com" >> backend/.env
docker compose up -d --build
```

---

## 🤝 Contributing

Pull requests welcome. For significant changes, open an issue first.

```bash
# Fork + clone
git checkout -b feature/your-feature
# Make changes
git commit -m "feat: your feature description"
git push origin feature/your-feature
# Open PR
```

---

<div align="center">

<br/>

**Built with 👻 by [GarbhitSingh](https://github.com/GarbhitSingh)**

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

<br/>

*GhostOps — Create. Automate. Dominate.*

</div>
