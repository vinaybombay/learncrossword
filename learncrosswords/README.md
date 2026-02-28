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
