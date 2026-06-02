<p align="center">
  <img src="https://img.shields.io/badge/Go-1.26-00ADD8?style=for-the-badge&logo=go&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/ChromaDB-FF6F00?style=for-the-badge&logo=databricks&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<h1 align="center">DevScheduler</h1>

<p align="center">
  A competitive programming dashboard that tracks your coding activity across LeetCode, Codeforces, CodeChef, and GeeksForGeeks — with automated streak reminders, contest countdowns, GitHub monitoring, and a RAG-powered chatbot that actually knows your stats.
</p>

<p align="center">
  <a href="#what-this-does">What This Does</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#the-chatbot">The Chatbot</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#running-locally">Setup</a> •
  <a href="#api-endpoints">API</a>
</p>

---

## What This Does

I built this because I kept forgetting to solve my daily LeetCode problem and my streak would die. I also wanted a single place to see all my competitive programming stats without opening five different websites.

DevScheduler does three things:

1. **Tracks your coding profiles** — Pulls data from LeetCode, Codeforces, CodeChef, GFG, and GitHub. Shows your solve count, streaks, heatmaps, contest ratings, and recent submissions in one dashboard.

2. **Nags you when you're slacking** — If you haven't solved anything today, it sends you an email reminder. It also sends countdown alerts before upcoming contests (60 min, 30 min, 15 min, 5 min, 1 min before start).

3. **Lets you ask questions about your data** — There's a floating chatbot widget on every page. It uses RAG (Retrieval-Augmented Generation) with ChromaDB as the vector store and Gemini as the LLM. You can ask stuff like "what's my LeetCode rating?" or "when's the next Codeforces contest?" and it answers from your actual data.

### Platform Coverage

| Platform | How Data is Fetched | What You Get |
|----------|-------------------|--------------|
| LeetCode | GraphQL API | Solve count, difficulty split, submission heatmap, streaks, contest rating history |
| Codeforces | REST API (`user.info`, `user.status`, `user.rating`) | Rating/rank with color tiers, tag distribution, submission calendar, contest history |
| CodeChef | Web scraping with Colly | Star rating, current/max rating, global + country rank, problems solved |
| GeeksForGeeks | Stats API + Colly scraping | Coding score, difficulty breakdown, streaks, institute rank |
| GitHub | Public Events API | Push events, PR tracking, repo activity |

---

## How It Works

The system has three separate processes that need to be running:

1. **Go Backend** (port 8080) — The main API server. Handles auth, proxies platform data, runs the job scheduler, and manages background monitors.
2. **React Frontend** (port 5173) — The dashboard UI. Talks to the Go backend over REST and receives real-time updates via SSE.
3. **Node.js Chatbot** (port 3001) — A separate Express server that handles the RAG chatbot. The Go backend proxies `/chat` requests to this service.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React 19)                           │
│  Vite · Tailwind v4 · Framer Motion · Lucide Icons                  │
└──────────────┬──────────────────────────────┬───────────────────────┘
               │  REST (JSON)                 │  SSE (real-time feed)
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     GO API SERVER (Gin, :8080)                       │
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Handlers  │  │  Services  │  │  Workers   │  │  Scheduler   │  │
│  │  (routes)  │→ │  (logic)   │→ │  (jobs)    │← │  (Redis poll)│  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘  │
│                                                                      │
│  ┌───────────────────────────┐  ┌────────────────────────────────┐  │
│  │  Background Monitors (5) │  │  SSE Hub                       │  │
│  │  • User analysis (5 min) │  │  • Broadcasts events to all    │  │
│  │  • Contest reminders     │  │    connected browser clients    │  │
│  │  • Inactivity checker    │  └────────────────────────────────┘  │
│  │  • Contest countdown     │                                      │
│  │  • GitHub tracker        │  ┌────────────────────────────────┐  │
│  └───────────────────────────┘  │  Chat Proxy → :3001           │  │
│                                  └────────────────────────────────┘  │
└──────────┬────────────────────────────────┬──────────────────────────┘
           │                                │
           ▼                                ▼
┌─────────────────────┐      ┌─────────────────────┐
│   Redis              │      │   MongoDB            │
│   • Job queue (ZSET) │      │   • users            │
│   • Reminder state   │      │   • monitored_regs   │
│   • Dedup keys       │      │   • activities        │
│   • Registered users │      └─────────────────────┘
└─────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  NODE.JS CHATBOT SERVICE (:3001)                     │
│  Express · OpenAI SDK (Gemini) · ChromaDB                           │
│                                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Routes  │→ │  Controller  │→ │  AI Service  │                  │
│  │  /chat   │  │  (parse req) │  │  (RAG query) │                  │
│  │  /ingest │  │              │  │  Gemini 2.5  │                  │
│  └──────────┘  └──────────────┘  └──────┬───────┘                  │
│                                          │                           │
│                                   ┌──────▼───────┐                  │
│                                   │   ChromaDB   │                  │
│                                   │   (vectors)  │                  │
│                                   └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘

           ┌──────────────────────────────────────────┐
           │         EXTERNAL APIs                     │
           │  • LeetCode GraphQL                       │
           │  • Codeforces REST API                    │
           │  • CodeChef (Colly scraper)               │
           │  • GeeksForGeeks (API + scraper)          │
           │  • GitHub Public Events                   │
           │  • Gmail SMTP                             │
           │  • Google Generative AI (Gemini)          │
           └──────────────────────────────────────────┘
```

### How the Inactivity Reminders Work

This was the trickiest part to get right. Here's the flow:

1. A background goroutine ticks **every 1 minute**.
2. It skips everything before **10 AM IST** — nobody wants emails at 3 AM.
3. For each registered user, it checks if they've solved anything today by hitting the platform API directly (LeetCode GraphQL, Codeforces `user.status`, etc.).
4. If they have solved something → it emits a "Streak Maintained" activity to the SSE feed and clears any pending reminder state.
5. If they haven't solved anything:
   - It checks how many reminders have already been sent today (capped at 50).
   - It checks if enough time has passed since the last reminder (60 minutes normally, 15 minutes after 8 PM).
   - If both checks pass, it creates an inactivity reminder job in the Redis job queue.
6. The scheduler engine picks up the job and passes it to the worker pool.
7. A worker sends the email via Gmail SMTP and emits a "Reminder Sent" activity to the SSE feed.

The emails are registered per-user per-platform, so you'll get separate reminders for LeetCode, Codeforces, and CodeChef if you're inactive on all three.

### How the Contest Countdown Works

Another background goroutine runs every 1 minute. It:

1. Fetches all upcoming contests from the contest service (which scrapes real contest schedules).
2. For each contest, checks if it starts in roughly 60, 30, 15, 5, or 1 minute.
3. If a countdown slot matches, it sends a reminder email to every user registered on that platform.
4. Redis deduplication keys (`contest_reminder_sent:{platform}:{contest}:{minutes}`) prevent sending the same countdown twice.

### How the Job Scheduler Works

The scheduler is dead simple:

- Jobs are stored in a Redis Sorted Set where the **score is a Unix timestamp** (when the job should run).
- The scheduler engine polls every 30 seconds, grabs all jobs whose score ≤ current time, removes them from the set, and pushes them into a Go channel.
- A pool of 5 worker goroutines reads from the channel and processes jobs concurrently.
- Job types: `email_notification`, `send_analysis`, `leetcode_contest`, `codechef_contest`, `leetcode_inactivity_reminder`, `contest_reminder`, `delayed_email`.

### Real-Time Activity Feed (SSE)

The dashboard has a live activity feed that updates without polling. It uses Server-Sent Events:

- When anything happens (analysis complete, reminder sent, GitHub push detected, contest approaching), the backend emits an event through the SSE Hub.
- All connected browser clients receive it instantly.
- Activities are persisted in Redis and categorized as `productivity`, `reminder`, `github`, `contest`, or `email`.

---

## The Chatbot

The chatbot is a separate Node.js microservice that runs alongside the Go backend. It uses RAG (Retrieval-Augmented Generation) to answer questions about your coding data.

### How It Works

1. **Data Ingestion** — The scraper service (`scraperService.js`) can crawl and ingest content into ChromaDB as vector embeddings using the default embedding function.
2. **Query Flow** — When you ask a question in the chat widget:
   - The frontend sends your message + user context (your platform IDs, upcoming contests) to the Go backend's `/chat` endpoint.
   - The Go backend proxies it to the Node.js service at `localhost:3001/api/chat`.
   - The chatbot queries ChromaDB for the 15 most relevant context chunks.
   - It builds a prompt with the context + your user profile and sends it to Google Gemini (`gemini-2.5-flash`) via the OpenAI-compatible API.
   - The response comes back through the proxy to the frontend.
3. **User Context** — The frontend automatically includes your platform usernames and upcoming contest schedule in every chat request, so the chatbot knows who you are without you having to tell it.

### Chatbot Architecture

```
chat-bot/
├── app.js                    # Express server entry point (port 3001)
├── config/
│   └── db.js                 # ChromaDB + OpenAI (Gemini) client setup
├── controllers/
│   ├── chatController.js     # Handles POST /api/chat requests
│   └── ingestController.js   # Handles POST /api/ingest for data loading
├── routes/
│   ├── chatRouter.js         # /api/chat route
│   └── ingestRouter.js       # /api/ingest route
├── services/
│   ├── aiService.js          # RAG query logic (ChromaDB search → Gemini)
│   └── scraperService.js     # Web scraper for ingesting data into ChromaDB
└── .env                      # GEMINI_API_KEY, OPENROUTER_API_KEY
```

---

## Project Structure

```
DevScheduler/
├── docker-compose.yml                    # MongoDB + Redis + Backend + Frontend
│
├── Backend/                              # Go API server
│   ├── main.go                           # Entry point — boots everything
│   ├── .env                              # Secrets (email, JWT, API keys)
│   ├── go.mod / go.sum                   # Go dependencies
│   │
│   ├── config/
│   │   ├── config.go                     # App config loader
│   │   ├── db.go                         # MongoDB connection + collections
│   │   └── redis.go                      # Redis client setup
│   │
│   ├── model/
│   │   ├── user.go                       # User, UserProfile, MonitoredRegistration
│   │   ├── job.go                        # Job model for the scheduler queue
│   │   └── activity.go                   # Activity feed item model
│   │
│   ├── handler/                          # HTTP handlers (one per feature area)
│   │   ├── auth_handler.go              # Signup, Login, Google OAuth
│   │   ├── chat_handler.go              # Proxy to Node.js chatbot service
│   │   ├── job_handler.go               # Register user, analyze, list users, contests
│   │   ├── leetcode_handler.go          # LeetCode profile/heatmap/submissions/contests
│   │   ├── codeforces_handler.go        # Codeforces analyze
│   │   ├── codechef_handler.go          # CodeChef analyze
│   │   ├── gfg_handler.go              # GFG analyze
│   │   ├── github_handler.go           # GitHub analyze
│   │   ├── activity_handler.go         # Activity feed + SSE stream
│   │   ├── schedule_email_handler.go   # Schedule delayed emails
│   │   └── user_handler.go            # User profile updates
│   │
│   ├── services/                        # Business logic
│   │   ├── platform_service.go         # Unified dispatcher for all platforms
│   │   ├── leetcode_service.go         # LeetCode GraphQL queries + streak calc
│   │   ├── codeforces_service.go       # Codeforces API + streak calc
│   │   ├── codechef_service.go         # CodeChef web scraping
│   │   ├── gfg_service.go             # GFG scraping + API
│   │   ├── github.go                   # GitHub events API
│   │   ├── github_profile_service.go   # GitHub profile data
│   │   ├── contest_service.go          # Upcoming contest schedule
│   │   ├── analysis_service.go         # Performance tier + rating analysis
│   │   ├── email_service.go            # Gmail SMTP sender
│   │   ├── email_templates.go          # Email body builders (inactivity, contest)
│   │   ├── activity_service.go         # Activity CRUD + SSE emission
│   │   ├── sse_hub.go                  # Server-Sent Events connection manager
│   │   ├── redis_keys.go              # Redis key patterns + dedup helpers
│   │   ├── auth_service.go            # JWT generation + bcrypt
│   │   ├── google_auth_service.go     # Google OAuth token verification
│   │   └── message_service.go         # Dynamic motivational messages
│   │
│   ├── workers/                        # Background job processors
│   │   ├── worker.go                   # Goroutine worker pool (5 workers)
│   │   ├── payloads.go                # Job payload structs
│   │   ├── email.go                   # Email notification worker
│   │   ├── notification_worker.go     # Inactivity + contest reminder worker
│   │   ├── analysis_worker.go         # User analysis worker
│   │   ├── leetcode.go               # LeetCode contest event worker
│   │   └── codechef.go               # CodeChef contest event worker
│   │
│   ├── scheduler/
│   │   └── engine.go                   # Redis ZSET poller → worker channel
│   │
│   ├── events/
│   │   ├── mointor.go                 # 5 background monitor goroutines
│   │   └── event_handler.go           # Event creators + user registry loader
│   │
│   ├── middleware/
│   │   └── jwt.go                     # JWT auth middleware
│   │
│   └── repository/
│       └── user_repository.go         # MongoDB queries for users + registrations
│
├── Frontend/                           # React SPA
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                    # Router, auth state, global ChatWidget
│       ├── index.css                  # Tailwind v4 + custom styles
│       │
│       ├── pages/
│       │   ├── LandingPage.jsx       # Public landing page
│       │   ├── Dashboard.jsx         # Main hub — analyze, stats, activity feed
│       │   ├── LeetCodePage.jsx      # LeetCode deep dive (heatmap, submissions, contests)
│       │   ├── CodeforcesPage.jsx    # Codeforces deep dive (rank colors, tags, rating Δ)
│       │   ├── CodeChefPage.jsx      # CodeChef deep dive (stars, ranks, contests)
│       │   ├── GFGPage.jsx           # GFG deep dive (score, difficulty breakdown)
│       │   ├── GitHubPage.jsx        # GitHub activity dashboard
│       │   ├── Contests.jsx          # Live contest countdowns (all platforms)
│       │   ├── Schedule.jsx          # Email scheduler with date/time picker
│       │   ├── Watch.jsx             # Manage monitored handles
│       │   ├── Profile.jsx           # User profile settings
│       │   ├── Login.jsx             # Login (email + Google)
│       │   └── Signup.jsx            # Registration
│       │
│       ├── components/
│       │   ├── Navbar.jsx            # Top nav with platform dropdown
│       │   ├── ChatWidget.jsx        # Floating AI chatbot (global, every page)
│       │   ├── ActivityFeed.jsx      # Real-time SSE activity feed
│       │   ├── ActivityItem.jsx      # Individual feed item
│       │   ├── ContestCountdown.jsx  # Live countdown timer
│       │   ├── StatsCard.jsx         # Animated stat card
│       │   ├── TierBadge.jsx         # Performance tier badge
│       │   ├── HealthIndicator.jsx   # Backend health status dot
│       │   ├── AuthModal.jsx         # Login/signup modal
│       │   ├── OnboardingModal.jsx   # First-login platform username capture
│       │   ├── GoogleAuthButton.jsx  # Google sign-in button
│       │   ├── LogoutButton.jsx      # Logout handler
│       │   └── ActionButton.jsx      # Gradient CTA button
│       │
│       ├── hooks/
│       │   └── useActivityFeed.js    # SSE connection hook
│       │
│       ├── services/
│       │   └── api.js                # REST client with auth headers
│       │
│       └── utils/
│           └── auth.js               # JWT storage + session helpers
│
└── chat-bot/                          # Node.js RAG chatbot microservice
    ├── app.js                         # Express server (port 3001)
    ├── .env                           # GEMINI_API_KEY, OPENROUTER_API_KEY
    ├── config/
    │   └── db.js                      # ChromaDB + Gemini client init
    ├── controllers/
    │   ├── chatController.js          # Chat request handler
    │   └── ingestController.js        # Data ingestion handler
    ├── routes/
    │   ├── chatRouter.js              # POST /api/chat
    │   └── ingestRouter.js            # POST /api/ingest
    └── services/
        ├── aiService.js               # ChromaDB query → Gemini completion
        └── scraperService.js          # Web scraper for data ingestion
```

---

## Running Locally

### What You Need

| Tool | Version | What For |
|------|---------|----------|
| Go | ≥ 1.21 | Backend API server |
| Node.js | ≥ 18 | Chatbot service + frontend tooling |
| Redis | ≥ 7.0 | Job queue, caching, deduplication |
| MongoDB | ≥ 6.0 | User storage, registrations |
| ChromaDB | latest | Vector store for the chatbot |

### 1. Clone

```bash
git clone https://github.com/Soham271/DevScheduler.git
cd DevScheduler
```

### 2. Start Infrastructure

```bash
# Option A: Using Docker
docker-compose up -d mongodb redis

# Option B: Manually
redis-server          # terminal 1
mongod                # terminal 2
chroma run            # terminal 3 (for chatbot)
```

### 3. Backend

```bash
cd Backend
go mod tidy
# Create .env (see below)
go run main.go
```

Server starts on `http://localhost:8080`.

### 4. Chatbot Service

```bash
cd chat-bot
npm install
# Create .env with GEMINI_API_KEY
node app.js
```

Chatbot starts on `http://localhost:3001`.

### 5. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`.

### Backend Environment Variables (`Backend/.env`)

```env
# Auth
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password     # Not your login password — generate at https://myaccount.google.com/apppasswords
JWT_SECRET=pick-something-long-and-random

# Database
MONGO_URI=mongodb://localhost:27017/devscheduler

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# AI (used by Go backend for analysis features)
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
AI_MODEL=gemini-2.5-flash
```

### Chatbot Environment Variables (`chat-bot/.env`)

```env
GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=your-openrouter-key     # optional fallback
```

---

## API Endpoints

### Auth (no token required)

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| POST | `/signup` | Register with email + password |
| POST | `/login` | Login → returns JWT |
| POST | `/auth/google` | Google OAuth sign-in |

### Platform Analysis (requires JWT)

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| POST | `/platforms/leetcode/analyze` | Full LeetCode profile + analysis |
| POST | `/platforms/codeforces/analyze` | Full Codeforces profile + analysis |
| POST | `/platforms/codechef/analyze` | Full CodeChef profile + analysis |
| POST | `/platforms/gfg/analyze` | Full GFG profile + analysis |
| POST | `/platforms/github/analyze` | GitHub activity analysis |

### LeetCode Detail Endpoints (public)

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | `/platforms/leetcode/profile?username=X` | Profile data |
| GET | `/platforms/leetcode/heatmap?username=X` | Submission calendar + streaks |
| GET | `/platforms/leetcode/submissions?username=X` | Recent submissions |
| GET | `/platforms/leetcode/contests?username=X` | Contest history + rating changes |

### User Management (requires JWT)

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| POST | `/register/:platform/:username` | Register a handle for monitoring (body: `{"email": "..."}`) |
| POST | `/user/profile` | Update user profile |
| POST | `/chat` | Proxy to chatbot service |
| POST | `/schedule-email` | Schedule a delayed email |
| POST | `/send-email` | Send an email immediately |

### Public Endpoints

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | `/users` | List all registered users |
| GET | `/contests/:platform` | Upcoming contests (`all`, `leetcode`, `codeforces`, etc.) |
| GET | `/activities` | Activity feed history |
| GET | `/activities/stream` | SSE real-time stream |
| GET | `/health` | Health check |

---

## Redis Key Patterns

```
Key                                              │ What It Stores
─────────────────────────────────────────────────┼─────────────────────────────
registered_user:{platform}:{username}            │ JSON with email, timestamps
user_activity:{platform}:{username}              │ Last known solve count
inactivity_count:{platform}:{username}           │ How many reminders sent today
inactivity_date:{platform}:{username}            │ Current tracking date (resets daily)
last_reminder_sent:{platform}:{username}         │ Unix timestamp of last email
contest_reminder_sent:{platform}:{contest}:{min} │ Dedup flag (prevents double-sends)
jobs (Sorted Set)                                │ Scheduled jobs (score = run timestamp)
```

---

## Monitoring Intervals

| What | How Often | Where |
|------|-----------|-------|
| Inactivity check | Every 1 minute (after 10 AM IST) | `events/mointor.go` |
| Reminder throttle | 60 min (before 8 PM), 15 min (after 8 PM) | `events/mointor.go` |
| Max reminders/day | 50 | `services/redis_keys.go` |
| User analysis | Every 5 minutes | `events/mointor.go` |
| Contest countdown | Every 1 minute | `events/mointor.go` |
| GitHub polling | Every 10 minutes | `events/mointor.go` |
| Job scheduler poll | Every 30 seconds | `scheduler/engine.go` |
| Worker pool | 5 goroutines | `main.go` |

---

## Tech Stack

**Backend:** Go 1.26, Gin, Redis, MongoDB, Colly (web scraping), JWT, bcrypt, Gmail SMTP, Server-Sent Events

**Frontend:** React 19, Vite 5, Tailwind CSS v4, Framer Motion, Lucide React, React Router v6

**Chatbot:** Node.js, Express, OpenAI SDK (Gemini-compatible), ChromaDB, Cheerio

**Infra:** Docker Compose, ChromaDB (vector store)

---

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-thing`)
3. Make your changes, commit them
4. Push and open a PR

---

## License

MIT — do whatever you want with it.

---

<p align="center">
  Built by <a href="https://github.com/Soham271">Soham</a>
</p>
