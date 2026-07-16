# PairUp 🤝

*Code together, in real time.*

PairUp is a real-time collaborative coding platform built for pair programming and mock technical interviews. Two or more users can join a shared room, write and run code together live, chat, and track session time — all in the browser.

## Live Demo
[Add your deployed link here once Week 8 is done]

## Features
- 🔐 JWT-based authentication with bcrypt password hashing
- 🔗 Shareable room links for instant collaboration
- ⚡ Real-time collaborative code editing (Socket.io + Monaco Editor), persisted so it survives page refreshes
- ▶️ Live multi-language code execution (JavaScript, Python) via E2B sandboxes
- 💬 In-room chat
- ⏱️ Synced countdown timer for mock interview practice
- 👥 Live participant count, updates instantly as people join/leave
- 📜 Session history — see rooms you've previously joined

## Tech Stack
**Frontend:** React (Vite), Monaco Editor, Socket.io Client, Axios, React Router
**Backend:** Node.js, Express, Socket.io, MongoDB (Mongoose), JWT, bcrypt
**Code Execution:** E2B Code Interpreter sandboxes
**Testing:** Jest

## Architecture


## Getting Started

### Prerequisites
- Node.js (LTS)
- MongoDB Atlas account (free tier)
- E2B account (free tier, no credit card required)

### Setup

**1. Clone and install**
```bash
git clone <your-repo-url>
cd pairup

cd server && npm install
cd ../client && npm install
```

**2. Configure environment variables**

`server/.env`:

`client/.env`:

**3. Run**
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Visit `http://localhost:5173`

### Running Tests
```bash
cd server
npm test
```

## Key Technical Decisions
- **Socket.io over polling** for real-time sync — needed instant bi-directional updates for a usable collaborative editor.
- **Persisted room state in MongoDB** — code and participant data are saved server-side so sessions survive page refreshes, not just held in browser memory.
- **E2B over Judge0** for code execution — after Piston's public API shut down and self-hosting Judge0 hit a Docker/Windows compatibility issue (isolate sandbox requires cgroups v1, unavailable on Docker Desktop for Windows), E2B's managed sandbox API provided reliable execution with a genuinely free tier.
- **JWT with manual implementation** (not a third-party auth provider) to demonstrate understanding of authentication fundamentals.

## Future Improvements
- Support for more languages (C++, Java) via custom E2B sandbox templates
- Video/audio calling via WebRTC
- Synced output across all participants when Run is clicked