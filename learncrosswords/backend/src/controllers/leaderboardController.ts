import { Response, Request } from 'express';
import User from '../models/User';

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { skip = 0, limit = 50 } = req.query;

    const users = await User.find()
      .select('username totalPoints level avatar')
      .sort({ totalPoints: -1 })
      .skip(parseInt(skip as string))
      .limit(parseInt(limit as string));

    const total = await User.countDocuments();

    const leaderboard = users.map((user, index) => ({
      rank: parseInt(skip as string) + index + 1,
      username: user.username,
      avatar: user.avatar,
      totalPoints: user.totalPoints,
      level: user.level,
    }));

    res.json({
      leaderboard,
      total,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

export async function getWeeklyLeaderboard(req: Request, res: Response) {
  try {
    // For now, return same as global. In production, track weekly stats separately
    const leaderboard = await getLeaderboard(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
}

export async function getFriendsLeaderboard(req: any, res: Response) {
  try {
    // Placeholder for friends leaderboard
    res.json({ message: 'Friends leaderboard feature coming soon' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch friends leaderboard' });
  }
}
