- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project

## Project Overview

Learn Crosswords is a gamified platform for learning cryptic crossword solving, built with React + Vite frontend and Node.js/Express backend.

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for bundling
- TailwindCSS for styling (minimal color palette)
- React Query for data fetching
- Zustand for state management
- Framer Motion for animations

**Backend:**
- Node.js with Express.js
- MongoDB for persistence
- JWT for authentication
- TypeScript

## Project Structure

```
learncrosswords/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Layout, reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API integration
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript interfaces
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
├── backend/                  # Node.js server
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   └── server.ts       # Express app setup
│   └── package.json
└── package.json            # Root workspace
```

## Key Features Implemented

1. **Authentication:** Register/login with JWT tokens
2. **Crossword Management:** Browse, filter, and solve crosswords
3. **User Progress:** Track completed puzzles and statistics
4. **Gamification:** Points, levels, streaks, and leaderboards
5. **Hints System:** Progressive hints infrastructure
6. **Clean Design:** Minimal color palette (Indigo, Slate, Emerald)

## Color Scheme

- Primary: Indigo (#4f46e5)
- Secondary: Slate (#64748b)
- Accent: Emerald (#10b981)
- Warning: Amber (#f59e0b)

## Development

### Install Dependencies
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### Start Development Servers
```bash
npm run dev
```

This runs both frontend (port 5173) and backend (port 3000) concurrently.

### Build for Production
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Crosswords
- `GET /api/crosswords` (with filters)
- `GET /api/crosswords/:id`
- `POST /api/crosswords/:id/submit`
- `POST /api/crosswords/:id/hints/:clueId/:level`

### User
- `GET /api/users/:id/progress`
- `GET /api/users/:id/stats`
- `PUT /api/users/:id/profile`

### Leaderboard
- `GET /api/leaderboard`
- `GET /api/leaderboard/weekly`

## Environment Setup

Create `.env` files:

**backend/.env:**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/learncrosswords
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:3000/api
```

## Legal & Copyright

- All crossword puzzles are original creations
- Inspired by Economic Times cryptic format but with original content
- No copyright infringement - educational fair use
- Users understand puzzles are for learning purposes

## Next Steps

1. Set up MongoDB instance (local or Atlas)
2. Run npm install in all directories
3. Create .env files from examples
4. Start development servers with npm run dev
5. Create sample crossword data
6. Implement interactive grid UI component
7. Deploy to production hosting
