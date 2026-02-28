export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
}

export interface Clue {
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  length: number;
}

export interface Hint {
  clueId: string;
  level: 1 | 2 | 3;
  content: string;
}

export interface Crossword {
  _id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
  gridData: string[];
  clues: Clue[];
  hints: Hint[];
  pointsReward: number;
  estimatedTime: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  _id: string;
  userId: string;
  crosswordId: string;
  answers: Record<number, string>;
  hintsUsed: number;
  pointsEarned: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  completedCrosswords: number;
  totalAttempts: number;
  completionRate: string;
}
