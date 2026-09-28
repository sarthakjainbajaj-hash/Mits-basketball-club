# 🏀 HoopScore — Live Basketball 3x3 Scoring & Match Management Web Application

> **Tagline:** Live Basketball 3x3 Scoring & Match Management  
> **Standard:** Official FIBA 3x3 Rules (10:00 Stop-Clock, 12s Shot Clock, 21-Point Sudden Victory, 7-Foul Penalty, 10-Foul Double Penalty)

HoopScore is a production-ready, full-stack web application designed for professional and collegiate 3x3 basketball tournaments. It features synchronized live scoreboards, drift-free timestamp-based game clocks, an independent 12-second shot clock, arena audio synthesizers, player box score attribution, live undos, tournament standings calculations, and dedicated spectator TV displays.

---

## 🌟 Key Features

1. **Official FIBA 3x3 Match Engine**:
   - **Real Game Clock (10:00)**: Timestamp-based countdown calculations (`remainingTime - (now - startedAt)`). Prevents drift and remains 100% accurate even if the browser tab sleeps or loses focus.
   - **Independent 12-Second Shot Clock**: Complete with `RESET 12`, `RESET 2` (offensive rebound), pause, resume, and critical visual warning at $\le$ 3 seconds.
   - **Sudden Victory Target Score (21 PTS)**: Match automatically ends when either team reaches 21 points, calculating the winner and triggering the arena horn.
   - **Foul Penalty System**: Visual LED pip counters. Automatic **BONUS (2 Free Throws)** at 7 team fouls and **DOUBLE BONUS (2 Free Throws + Ball Possession)** at 10 fouls.
   - **Possession Toggle**: Directional indicators (`← TEAM A` / `TEAM B →`) with event tracking.
   - **Timeouts**: FIBA 3x3 standard 1 timeout per team per game with automatic clock stoppage and referee whistle audio.

2. **Scorer & Spectator Real-Time Split (Socket.IO)**:
   - **Scorer Console (`/matches/:id/live`)**: Full control suite for scores (+1, +2, -1, -2), foul adjustments, clock toggles, and live box scores.
   - **Spectator Public Scoreboard (`/live/:matchId`)**: Clean, distraction-free scoreboard with huge LED digits, landscape support, and an `[ENTER FULLSCREEN]` mode for projectors or court TVs.
   - **Socket.IO Room Architecture**: Rooms keyed by `match:{matchId}` for instant sub-millisecond updates without page refreshes.

3. **In-Match Player Attribution & Box Scores**:
   - Scoring points triggers an attribution modal to select the exact scorer (`#7 Rahul Sharma`, `#11 Aman Verma`, `#23 Rohit Gupta`).
   - Live tracking for: **PTS, 1PT, 2PT, REB, AST, STL, BLK, FOUL**.
   - Rapid one-click `+REB`, `+AST`, `+STL`, `+BLK` buttons during game action.

4. **Multi-Action Undo Engine**:
   - Reverts the most recent action (score, foul, possession, timeout, player stat) using chronological event history snapshots without page reloads.

5. **Web Audio API Arena Synthesizer**:
   - Generates authentic electronic shot clock buzzers, brass arena horns, and referee whistles directly via the browser's `AudioContext`. Zero broken external MP3 dependencies.

6. **Tournament & Standings Engine**:
   - Full 3x3 standings table computed dynamically from completed matches: **Played, Won, Lost, Points For (PF), Points Against (PA), Point Difference (DIFF)**.

7. **Downloadable & Printable Match Reports**:
   - Clean, CSS `@media print` optimized box score reports for post-game printouts or PDF export.

8. **Role-Based Authentication (RBAC)**:
   - **Admin**: Full control over teams, players, tournaments, matches, users, and rules.
   - **Scorer**: Live scoreboard controls, timer start/pause, score adjustments, fouls, and match completion.
   - **Viewer**: Read-only spectator access to live scores, match history, leaderboards, and standings.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (with custom stadium LED typography and dark court palettes)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Real-Time Client**: Socket.IO Client
- **HTTP Client**: Axios with JWT interceptors
- **Audio**: Web Audio API Sound Synthesizer

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose (supports MongoDB Atlas and local MongoDB with embedded in-memory fallback)
- **Real-Time Server**: Socket.IO with room broadcasting
- **Authentication**: JWT (`jsonwebtoken`) & password hashing with `bcryptjs`
- **Security**: CORS, role-based route protection, input sanitization

---

## 📂 Project Structure

```
portfolio-website/
├── package.json             # Root workspace orchestrator (scripts: dev, client, server, seed)
├── README.md                # Complete documentation
│
├── backend/
│   ├── .env                 # Server environment variables
│   ├── .env.example         # Server environment variables template
│   ├── package.json
│   └── src/
│       ├── server.js        # Express app & Socket.IO server entry
│       ├── config/
│       │   └── db.js        # MongoDB connection with Atlas / Local / In-memory fallback
│       ├── models/          # User, Team, Player, Tournament, Match, MatchEvent
│       ├── controllers/     # auth, team, player, tournament, match, liveMatch
│       ├── routes/          # authRoutes, teamRoutes, playerRoutes, tournamentRoutes, matchRoutes
│       ├── sockets/         # matchSocket.js (room management and event dispatch)
│       ├── middleware/      # auth (JWT), role (RBAC), errorHandler
│       └── seeds/
│           └── seed.js      # Comprehensive demo database seeder
│
└── frontend/
    ├── .env                 # Frontend environment variables
    ├── .env.example         # Frontend environment variables template
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx         # React DOM mount point
        ├── App.jsx          # Routes, Providers, and Layout
        ├── index.css        # Tailwind styles & LED typography
        ├── api/             # axiosClient, authApi, teamApi, playerApi, tournamentApi, matchApi
        ├── context/         # AuthContext, SocketContext, SoundContext
        ├── services/        # soundService (Web Audio API Synthesizer)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── Common/      # Toast, Modal, StatCard
        │   └── Scoreboard/  # DigitalTimer, ShotClock, TeamScoreCard, FoulTracker, PossessionArrow, QuickScorerModal, LivePlayerStats
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── TeamsPage.jsx
            ├── TeamDetailsPage.jsx
            ├── PlayersPage.jsx
            ├── TournamentsPage.jsx
            ├── TournamentDetailsPage.jsx
            ├── CreateMatchPage.jsx
            ├── MatchSetupPage.jsx
            ├── LiveScoreboardPage.jsx
            ├── PublicScoreboardPage.jsx
            ├── MatchHistoryPage.jsx
            ├── MatchDetailsPage.jsx
            ├── PlayerStatsPage.jsx
            ├── SettingsPage.jsx
            └── NotFoundPage.jsx
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24.15.0)
- **MongoDB**: MongoDB Atlas connection URI or local MongoDB daemon running on port 27017. *(Note: If no external MongoDB instance is detected, the backend automatically launches an embedded in-memory MongoDB instance for seamless instant testing!)*

### 2. Install Dependencies
Run from the root directory:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hoopscore
JWT_SECRET=hoopscore_super_secret_jwt_key_2026_basketball_3x3
CLIENT_URL=http://localhost:5173
```
> For **MongoDB Atlas**, simply replace `MONGO_URI` with your connection string:  
> `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hoopscore?retryWrites=true&w=majority`

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🌱 Seeding the Database

Populate realistic demo teams (**Thunderbolts 3x3**, **Viper Strike 3x3**, **Metro Hawks 3x3**, **Urban Titans 3x3**), players with stats, an ongoing tournament, completed matches, and an active live match:

```bash
npm run seed
# or: cd backend && node src/seeds/seed.js
```

### 🔑 Test User Credentials
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hoopscore.com` | `admin123` | Full CRUD for teams, players, tournaments, matches, users |
| **Scorer** | `scorer@hoopscore.com` | `scorer123` | Score control, clock controls, foul management, end match |
| **Viewer** | `viewer@hoopscore.com` | `viewer123` | Read-only spectator access to scoreboard and history |

*(Tip: On the `/login` screen, click any of the **Quick Demo Access** buttons to instantly fill in these credentials!)*

---

## 🚀 Running the Application

### Option A: Run Both Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

### Option B: Run Individually in Separate Terminals
**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 📺 How to Test the Live Scoreboard with Two Browser Windows

To experience the real-time WebSocket synchronization across devices:

1. **Window 1 (Official Scorer Console)**:
   - Log in at `http://localhost:5173/login` using **`scorer@hoopscore.com`** / **`scorer123`**.
   - Navigate to the **Dashboard** and click **"Open Live Scoreboard"** on the featured live match (or select any match from the schedule).
   - URL: `http://localhost:5173/matches/<matchId>/live`

2. **Window 2 (Spectator TV / Projector Display)**:
   - Open an incognito or secondary window at:  
     `http://localhost:5173/live/<matchId>`
   - Notice this page has **no scorer controls**—only massive LED score displays, clock, shot clock, and an **`[ENTER FULLSCREEN]`** button.

3. **Live Sync Actions**:
   - In **Window 1 (Scorer)**, click **`[START CLOCK]`** $\rightarrow$ Both windows immediately count down simultaneously.
   - Click **`+2 PT`** for Team A and select `#7 Rahul Sharma` $\rightarrow$ Team A score updates from `14` to `16` instantly in Window 2 without refreshing!
   - Click **`[RESET 12]`** on the shot clock $\rightarrow$ The shot clock resets to 12s on the spectator screen instantly.
   - Click **`[UNDO LAST ACTION]`** $\rightarrow$ The score safely rolls back in both windows.
   - When a team reaches **21 PTS**, the match ends automatically, the game end arena horn sounds, and official box scores are written to MongoDB!

---

## 🏀 Complete Match Lifecycle Walkthrough

1. **Create Teams**: Go to `Teams` $\rightarrow$ Click `Add Team` (e.g., Team Name, Short Name, Colors, Coach).
2. **Add Players**: Go to `Players` $\rightarrow$ Click `Add Player` (Assign to team, specify jersey number and position).
3. **Schedule Match**: Go to `Dashboard` or `Tournaments` $\rightarrow$ Click `Create Match` $\rightarrow$ Select Home & Away teams $\rightarrow$ Configure rules.
4. **Pre-Game Staging**: On `/matches/:id/setup`, conduct the coin toss to select opening possession $\rightarrow$ Click **"START GAME & OPEN LIVE SCOREBOARD"**.
5. **Score Match**:
   - Start/pause main countdown timer.
   - Operate 12s shot clock.
   - Attribute points to individual scorers.
   - Log fouls and track penalty free-throw warnings.
   - Toggle possession.
   - Record in-game rebounds, assists, steals, and blocks.
6. **End & Persist Match**: Click `[END MATCH]` $\rightarrow$ Winner is calculated, team wins/losses and player stats are incremented in MongoDB.
7. **Post-Game Analysis**: Visit `/matches/:id` for the comprehensive box score and click **`[Download Match Report]`** to print.

---

## 🌐 Production Deployment Guide

### Deploying Frontend (e.g., Vercel / Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variables:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-backend-api.onrender.com`

### Deploying Backend (e.g., Render / Railway / Heroku / AWS)
1. Build command: `npm install`
2. Start command: `node src/server.js`
3. Environment variables:
   - `PORT`: `5000`
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/hoopscore`
   - `JWT_SECRET`: `your_secure_production_secret`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`

---

## 📜 License
MIT License. Built for sports-tech tournaments and FIBA 3x3 organizers worldwide.
