// ── User & Auth ──────────────────────────────────────────────────────────────

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

export interface UserStats {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  completedCrosswords: number;
  totalAttempts: number;
  completionRate: string;
}

// ── Puzzle system (cryptic crosswords) ──────────────────────────────────────

export type ClueType = 'ANAG' | 'HID' | 'HIDR' | 'ACRO' | 'LAST' | 'ALT' | 'SND' | 'CHAR';

export interface PuzzleClue {
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  letterCount: string; // e.g. "4" or "3,4"
  startRow: number;
  startCol: number;
  length: number;
  clueType: ClueType;
  definitionStart?: boolean;
  indicatorWord?: string;
}

export interface PuzzleCell {
  row: number;
  col: number;
  isBlack: boolean;
  number: number | null;
  acrossStart: boolean;
  downStart: boolean;
}

export interface PuzzleGridData {
  cells: PuzzleCell[][];
  rows: number;
  cols: number;
}

export interface Puzzle {
  _id: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  gridData: PuzzleGridData;
  clues: PuzzleClue[];
  solution: string[][];
  publishedAt: string;
  tricksUsed?: string[];
}
