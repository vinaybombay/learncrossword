# Learn Crosswords - Gamified Cryptic Crossword Learning Platform

A modern, gamified platform for learning how to solve cryptic crosswords, inspired by Duolingo's engaging learning methodology.

## Overview

Learn Crosswords helps users master the art of solving cryptic crosswords through:
- **Progressive Learning**: Start with simple puzzles and gradually increase difficulty
- **Gamification**: Earn points, streaks, and unlock levels
- **Smart Hints System**: Three-tier hint system to guide without giving away answers
- **Clean Design**: Minimal color palette with intuitive UI
- **Daily Challenges**: Keep users engaged with fresh puzzles

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **TailwindCSS** for styling (minimal color palette)
- **React Query** for state management
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **MongoDB** for data persistence
- **JWT** for authentication
- **Nodemon** for development

## Project Structure

```
learncrosswords/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── backend/                  # Node.js/Express server
│   ├── src/
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── server.ts
│   └── package.json
├── README.md
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Configure environment variables:
   - `backend/.env` - Database URL, JWT secret, etc.
   - `frontend/.env` - API endpoint

3. Start development servers:
```bash
npm run dev
```

This will run both frontend (port 5173) and backend (port 3000) in parallel.

## Features

### Core Features
- ✅ User authentication (registration, login, logout)
- ✅ Crossword puzzle grid display
- ✅ Clues system (across and down)
- ✅ Progressive hints (3 levels)
- ✅ Answer validation and scoring
- ✅ User progress tracking
- ✅ Daily challenges
- ✅ Leaderboard

### Design Principles
- Minimal color palette (primary: indigo, secondary: slate, accent: emerald)
- Clean, distraction-free interface
- Smooth animations and feedback
- Mobile-responsive design
- Accessible UI components

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Crosswords
- `GET /api/crosswords` - Get list of crosswords
- `GET /api/crosswords/:id` - Get specific crossword
- `POST /api/crosswords/:id/submit` - Submit answers

### User Progress
- `GET /api/users/:id/progress` - Get user progress
- `GET /api/users/:id/stats` - Get user statistics

### Hints
- `POST /api/crosswords/:id/hints` - Get hint for a clue

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/weekly` - Get weekly leaderboard

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

### Build for Production
```bash
npm run build
```

### Running Tests
```bash
# Backend (Jest + Supertest, uses MongoMemoryServer — no real DB needed)
cd backend && npm test

# Frontend (Vitest + Testing Library)
cd frontend && npm test -- --run
```

---

## Deployment

The app is deployed as three separate services:

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `https://REPLACE_WITH_VERCEL_URL` |
| Backend | Railway | `https://REPLACE_WITH_RAILWAY_URL` |
| Database | MongoDB Atlas | M0 free cluster |

> **After deploying**, replace the placeholder URLs above with your actual URLs.

---

### 1 — MongoDB Atlas (database)

1. Go to [atlas.mongodb.com](https://atlas.mongodb.com) → create a free account
2. Create a new **M0 (free)** cluster in your preferred region
3. **Database Access** → Add a new user with a strong password (note the credentials)
4. **Network Access** → Add IP `0.0.0.0/0` *(Railway uses dynamic IPs)*
5. Click **Connect** on your cluster → **Compass / Drivers** → copy the connection string
   It looks like: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/learncrosswords`
6. Keep this string — you'll paste it into Railway next

---

### 2 — Railway (backend)

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select the `learncrossword` repository
3. When prompted for a **root directory**, set it to `backend`
4. Railway will detect Node.js via `railway.toml` and run `npm install && npm run build`
5. Under **Variables**, add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | A strong random string (32+ chars) |
| `JWT_EXPIRE` | `7d` |
| `FRONTEND_URL` | Your Vercel URL *(add after step 3 below, then redeploy)* |

6. After the first deploy, copy your Railway URL (e.g. `https://learncrossword-production.up.railway.app`)
7. Verify: `curl https://<railway-url>/api/health` → should return `{"status":"OK",...}`

#### Seed the database (run once after first deploy)

```bash
# From your local machine, with MONGODB_URI exported:
export MONGODB_URI="mongodb+srv://..."
cd backend
npm run build
node dist/seeds/seedDatabase.js
```

---

### 3 — Vercel (frontend)

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import `learncrossword` from GitHub
2. Set **Root Directory** to `frontend`
3. Under **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://<your-railway-url>/api` |

4. Click **Deploy** → copy your Vercel URL (e.g. `https://learncrossword.vercel.app`)
5. Go back to Railway → update `FRONTEND_URL` = your Vercel URL → trigger a redeploy

---

### CI/CD — GitHub Actions

Every push to `main` automatically runs:
- **Backend**: `npm ci && npm test` (Jest, ~3s)
- **Frontend**: `npm ci && npm run build && npm test -- --run` (Vite build + Vitest, ~10s)

Check the **Actions** tab in GitHub to see live build status.

## Design Colors

The app uses a minimal color palette:
- **Primary**: Indigo (actions, highlights)
- **Secondary**: Slate (text, backgrounds)
- **Accent**: Emerald (success, correct answers)
- **Warning**: Amber (incomplete, hints used)
- **Neutral**: Gray (borders, dividers)

## Copyright & Legal

All crossword puzzles are original creations inspired by the cryptic crossword format. We ensure:
- Original puzzle creation
- Proper attribution where applicable
- No copyright infringement
- Fair use of puzzle formats

## Contributing

Contributions are welcome! Please ensure:
- Code follows project style guide
- New features maintain minimal design philosophy
- All tests pass

## License

MIT License - See LICENSE file for details

## Support

For issues, feature requests, or questions, please open an issue on GitHub.
