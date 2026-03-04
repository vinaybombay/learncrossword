import { Request, Response } from 'express';
import { Puzzle } from '../models/Puzzle';

/**
 * GET /api/puzzles/daily
 * Returns today's published puzzle(s) — solution is NOT included (server-side only).
 * Optional query: ?difficulty=beginner|intermediate|advanced
 */
export const getDailyPuzzle = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query: any = {
      isDraft: false,
      publishedAt: { $gte: today, $lt: tomorrow },
    };

    if (req.query.difficulty) {
      query.difficulty = req.query.difficulty;
    }

    // Exclude solution from client response
    const puzzles = await Puzzle.find(query)
      .select('-solution')
      .sort({ difficulty: 1 });

    if (!puzzles.length) {
      return res.status(404).json({ error: 'No puzzle published for today' });
    }

    // If a specific difficulty was requested, return single object
    if (req.query.difficulty) {
      return res.json(puzzles[0]);
    }

    // Otherwise return all three (beginner, intermediate, advanced)
    return res.json(puzzles);
  } catch (err) {
    console.error('getDailyPuzzle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/puzzles/archive
 * Returns last 30 published puzzles (slug, date, difficulty, gridSize only).
 */
export const getPuzzleArchive = async (_req: Request, res: Response) => {
  try {
    const puzzles = await Puzzle.find(
      { isDraft: false },
      { slug: 1, publishedAt: 1, difficulty: 1, gridSize: 1 }
    )
      .sort({ publishedAt: -1 })
      .limit(30);

    res.json(puzzles);
  } catch (err) {
    console.error('getPuzzleArchive error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/puzzles/:slug
 * Returns a full puzzle by slug — solution is NOT included (server-side only).
 */
export const getPuzzleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const puzzle = await Puzzle.findOne({ slug }).select('-solution');

    if (!puzzle) {
      return res.status(404).json({ error: `Puzzle not found: ${slug}` });
    }

    res.json(puzzle);
  } catch (err) {
    console.error('getPuzzleBySlug error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
