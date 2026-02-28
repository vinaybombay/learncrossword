# Quick Start Guide - Learn Crosswords

## 1. Project Setup

### Clone/Navigate to the project
```bash
cd /Users/vinayakneeralli/Claude/Personal/learncrosswords
```

### Install root dependencies
```bash
npm install
```

### Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

### Install backend dependencies
```bash
cd backend
npm install
cd ..
```

## 2. Configure Environment

### Backend (.env)
Create `backend/.env` (copy from `.env.example`):
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/learncrosswords
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
Create `frontend/.env` (copy from `.env.example`):
```
VITE_API_URL=http://localhost:3000/api
```

## 3. Start Development

### Option A: Run both servers together
```bash
npm run dev
```

This runs:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Option B: Run separately
Terminal 1 (Frontend):
```bash
cd frontend && npm run dev
```

Terminal 2 (Backend):
```bash
cd backend && npm run dev
```

## 4. Database Setup

### Option 1: Local MongoDB
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

## 5. Test the App

1. **Frontend loads**: http://localhost:5173
2. **Home page**: Browse features
3. **Register**: Create account at `/register`
4. **Browse**: Check `/crosswords` (works without login)
5. **Login**: Login to access dashboard
6. **Dashboard**: View stats at `/dashboard`
7. **Leaderboard**: Check `/leaderboard`

## 6. Access Logs

**Frontend errors**: Check browser console (F12)
**Backend errors**: Check terminal running backend server
**API health check**: http://localhost:3000/api/health

## Project Structure

```
learncrosswords/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── pages/     # Route pages
│   │   ├── components/# UI components
│   │   ├── services/  # API calls
│   │   └── types/     # TypeScript types
│   └── package.json
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── models/    # MongoDB schemas
│   │   ├── routes/    # API endpoints
│   │   ├── controllers/ # Route logic
│   │   └── server.ts  # Express setup
│   └── package.json
└── README.md
```

## Common Commands

```bash
# Build for production
npm run build

# Run tests
npm test

# Install a package (from root)
npm install package-name
cd frontend && npm install package-name

# Format code
cd frontend && npm run lint
```

## Design System

**Colors:**
- Primary: Indigo (#4f46e5) - Main actions
- Secondary: Slate (#64748b) - Text/backgrounds
- Accent: Emerald (#10b981) - Success/completed
- Warning: Amber (#f59e0b) - Incomplete/hints used

**Typography:**
- Fonts: System fonts (no external dependencies)
- Sizes: Responsive with Tailwind

## Features Status

✅ Authentication (register/login)
✅ Crossword browsing & filtering
✅ User progress tracking
✅ Points & level system
✅ Leaderboard
⏳ Interactive grid UI (needs implementation)
⏳ Real hint system (infrastructure ready)
⏳ Daily challenges (schema ready)
⏳ Social features (friends, sharing)

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### MongoDB connection failed
- Check MongoDB is running: `brew services list`
- Check connection string in `.env`
- Try Atlas connection string if local fails

### Dependencies issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

## Next Steps

1. **Add sample data**: See `SAMPLE_CROSSWORDS_GUIDE.md`
2. **Implement grid UI**: Create crossword grid component
3. **Add animations**: Enhance with Framer Motion
4. **Deploy**: Push to GitHub and deploy to hosting
5. **Scale**: Add more features and puzzles

## Support

For issues, check:
- Browser console for frontend errors
- Backend terminal for API errors
- MongoDB connection logs
- Network tab for API requests

Good luck building! 🎮✨
