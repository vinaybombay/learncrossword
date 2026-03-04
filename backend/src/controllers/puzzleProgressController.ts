import { Response } from 'express';
import { Puzzle } from '../models/Puzzle';
import UserProgress from '../models/UserProgress';
import User from '../models/User';
import { AuthRequest } from '../middleware/authenticate';

// Points awarded by difficulty (base × correct/total)
const BASE_POINTS: Record<string, number> = {
  beginner: 100,
  intermediate: 250,
  advanced: 500,
};

/**
 * Returns UTC midnight for a given date (or today if omitted).
 */
function utcMidnight(date?: Date): Date {
  const d = date ? new Date(date) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * POST /api/puzzles/:slug/submit
 * Checks answers server-side, records UserProgress, updates User stats.
 * Idempotent: re-submitting returns the same result without adding more points.
 */
export async function submitPuzzle(req: AuthRequest, res: Response) {
  try {
    const { slug } = req.params;
    const userId = req.userId!;
    const { answers } = req.body as { answers: Record<string, string> };

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers object is required' });
    }

    // Fetch puzzle with solution (not stripped here — server use only)
    const puzzle = await Puzzle.findOne({ slug }).select('+solution');
    if (!puzzle) {
      return res.status(404).json({ error: `Puzzle not found: ${slug}` });
    }

    // Check if already submitted
    const existing = await UserProgress.findOne({
      userId,
      puzzleId: puzzle._id,
      completed: true,
    });
    if (existing) {
      return res.json({
        alreadySubmitted: true,
        correct: Math.round((existing.score / 100) * /* approximate */ 1),
        total: 1,
        score: existing.score,
        pointsEarned: existing.pointsEarned,
        difficulty: puzzle.difficulty,
      });
    }

    // Count correct cells
    const { rows, cols, cells } = puzzle.gridData;
    let correct = 0;
    let total = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!cells[r]?.[c]?.isBlack) {
          total++;
          const entered = (answers[`${r},${c}`] ?? '').trim().toUpperCase();
          const sol = (puzzle.solution?.[r]?.[c] ?? '').toUpperCase();
          if (entered === sol && entered !== '') correct++;
        }
      }
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const base = BASE_POINTS[puzzle.difficulty] ?? 100;
    const pointsEarned = Math.round(base * (correct / (total || 1)));

    // Convert answers Record to Map for Mongoose
    const answersMap = new Map<string, string>(Object.entries(answers));

    // Upsert UserProgress — mark completed
    await UserProgress.findOneAndUpdate(
      { userId, puzzleId: puzzle._id },
      {
        $set: {
          answers: answersMap,
          completed: true,
          completedAt: new Date(),
          score,
          pointsEarned,
        },
      },
      { upsert: true, new: true }
    );

    // Update User stats (atomic)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const todayUTC = utcMidnight();
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

    const lastSolved = user.lastSolvedAt ? utcMidnight(user.lastSolvedAt) : null;
    const alreadySolvedToday = lastSolved?.getTime() === todayUTC.getTime();

    if (!alreadySolvedToday) {
      const consecutiveDay = lastSolved?.getTime() === yesterdayUTC.getTime();
      user.currentStreak = consecutiveDay ? user.currentStreak + 1 : 1;
      user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
      user.lastSolvedAt = todayUTC;
    }

    user.totalPoints += pointsEarned;
    user.level = Math.floor(user.totalPoints / 500) + 1;

    await user.save();

    return res.json({
      alreadySubmitted: false,
      correct,
      total,
      score,
      pointsEarned,
      difficulty: puzzle.difficulty,
      user: {
        totalPoints: user.totalPoints,
        level: user.level,
        currentStreak: user.currentStreak,
      },
    });
  } catch (err) {
    console.error('submitPuzzle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * POST /api/puzzles/:slug/progress
 * Auto-saves in-progress answers (upserts without marking completed).
 * Will not overwrite a completed record.
 */
export async function savePuzzleProgress(req: AuthRequest, res: Response) {
  try {
    const { slug } = req.params;
    const userId = req.userId!;
    const { answers } = req.body as { answers: Record<string, string> };

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers object is required' });
    }

    const puzzle = await Puzzle.findOne({ slug }).select('_id');
    if (!puzzle) {
      return res.status(404).json({ error: `Puzzle not found: ${slug}` });
    }

    const answersMap = new Map<string, string>(Object.entries(answers));

    // Only update if not already completed
    await UserProgress.findOneAndUpdate(
      { userId, puzzleId: puzzle._id, completed: false },
      {
        $set: { answers: answersMap },
        $setOnInsert: { completed: false, score: 0, pointsEarned: 0 },
      },
      { upsert: true }
    );

    res.sendStatus(204);
  } catch (err) {
    console.error('savePuzzleProgress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * GET /api/puzzles/:slug/progress
 * Returns the user's saved progress for a puzzle (for restoring state on reload).
 */
export async function getPuzzleProgress(req: AuthRequest, res: Response) {
  try {
    const { slug } = req.params;
    const userId = req.userId!;

    const puzzle = await Puzzle.findOne({ slug }).select('_id');
    if (!puzzle) {
      return res.status(404).json({ error: `Puzzle not found: ${slug}` });
    }

    const progress = await UserProgress.findOne({ userId, puzzleId: puzzle._id });
    if (!progress) {
      return res.json(null);
    }

    return res.json({
      answers: Object.fromEntries(progress.answers),
      completed: progress.completed,
      pointsEarned: progress.pointsEarned,
      score: progress.score,
    });
  } catch (err) {
    console.error('getPuzzleProgress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
