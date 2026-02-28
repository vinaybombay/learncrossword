import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authenticate';

export async function register(req: any, res: Response) {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    const user = new User({
      email,
      username,
      password,
      firstName,
      lastName,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: any, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        totalPoints: user.totalPoints,
        level: user.level,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function logout(req: AuthRequest, res: Response) {
  // In a stateless JWT system, logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      totalPoints: user.totalPoints,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      level: user.level,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
