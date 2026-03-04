import { Response } from 'express';
import User from '../models/User';
import UserProgress from '../models/UserProgress';
import { AuthRequest } from '../middleware/authenticate';

export async function getUserProgress(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (req.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const progress = await UserProgress.find({ userId: id })
      .populate('puzzleId', 'slug difficulty')
      .sort({ updatedAt: -1 });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
}

export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (req.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const completedCount = await UserProgress.countDocuments({
      userId: id,
      completed: true,
    });

    const totalAttempts = await UserProgress.countDocuments({ userId: id });

    res.json({
      totalPoints: user.totalPoints,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      completedCrosswords: completedCount,
      totalAttempts,
      completionRate: totalAttempts > 0 ? ((completedCount / totalAttempts) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function updateUserProfile(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { firstName, lastName, avatar } = req.body;

    if (req.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, avatar },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
}
