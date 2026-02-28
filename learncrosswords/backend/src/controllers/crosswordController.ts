import { Response } from 'express';
import Crossword from '../models/Crossword';
import UserProgress from '../models/UserProgress';
import User from '../models/User';
import { AuthRequest } from '../middleware/authenticate';

export async function getCrosswords(req: any, res: Response) {
  try {
    const { difficulty, skip = 0, limit = 10 } = req.query;

    let query: any = {};
    if (difficulty) query.difficulty = difficulty;

    const crosswords = await Crossword.find(query)
      .select('-gridData')
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Crossword.countDocuments(query);

    res.json({
      crosswords,
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crosswords' });
  }
}

export async function getCrosswordById(req: any, res: Response) {
  try {
    const crossword = await Crossword.findById(req.params.id);
    if (!crossword) {
      return res.status(404).json({ error: 'Crossword not found' });
    }

    res.json(crossword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crossword' });
  }
}

export async function submitCrossword(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const crossword = await Crossword.findById(id);
    if (!crossword) {
      return res.status(404).json({ error: 'Crossword not found' });
    }

    // Calculate correct answers
    let correctCount = 0;
    crossword.clues.forEach((clue) => {
      const userAnswer = answers[clue.number]?.toUpperCase();
      if (userAnswer === clue.answer) {
        correctCount++;
      }
    });

    const isCompleted = correctCount === crossword.clues.length;
    const pointsEarned = isCompleted ? crossword.pointsReward : Math.floor((correctCount / crossword.clues.length) * crossword.pointsReward);

    // Update or create user progress
    let progress = await UserProgress.findOne({
      userId: req.userId,
      crosswordId: id,
    });

    if (!progress) {
      progress = new UserProgress({
        userId: req.userId,
        crosswordId: id,
      });
    }

    progress.answers = new Map(Object.entries(answers));
    progress.completed = isCompleted;
    progress.pointsEarned = pointsEarned;
    if (isCompleted) progress.completedAt = new Date();

    await progress.save();

    // Update user stats if completed
    if (isCompleted && !progress.completed) {
      const user = await User.findById(req.userId);
      if (user) {
        user.totalPoints += pointsEarned;
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
        if (user.totalPoints >= user.level * 500) {
          user.level += 1;
        }
        user.completedCrosswords.push(crossword._id);
        await user.save();
      }
    }

    res.json({
      completed: isCompleted,
      correctCount,
      totalClues: crossword.clues.length,
      pointsEarned,
      message: isCompleted ? 'Congratulations! Crossword completed!' : 'Keep trying!',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit crossword' });
  }
}

export async function getHint(req: AuthRequest, res: Response) {
  try {
    const { id, clueId, level } = req.params;

    const crossword = await Crossword.findById(id);
    if (!crossword) {
      return res.status(404).json({ error: 'Crossword not found' });
    }

    const hint = crossword.hints.find(
      (h) => h.clueId.toString() === clueId && h.level === parseInt(level)
    );

    if (!hint) {
      return res.status(404).json({ error: 'Hint not found' });
    }

    // Track hint usage
    const progress = await UserProgress.findOne({
      userId: req.userId,
      crosswordId: id,
    });

    if (progress) {
      progress.hintsUsed += 1;
      await progress.save();
    }

    res.json({ hint: hint.content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hint' });
  }
}
