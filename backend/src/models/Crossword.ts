import mongoose, { Schema, Document } from 'mongoose';

export interface IClue extends Document {
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  length: number;
}

export interface IHint extends Document {
  clueId: string;
  level: number; // 1, 2, or 3
  content: string;
}

export interface ICrossword extends Document {
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
  gridData: string[]; // Each character or '.' for empty
  clues: IClue[];
  hints: IHint[];
  pointsReward: number;
  estimatedTime: number; // in minutes
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const hintSchema = new Schema<IHint>({
  clueId: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    enum: [1, 2, 3],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const clueSchema = new Schema<IClue>({
  number: {
    type: Number,
    required: true,
  },
  direction: {
    type: String,
    enum: ['across', 'down'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
    uppercase: true,
  },
  length: {
    type: Number,
    required: true,
  },
});

const crosswordSchema = new Schema<ICrossword>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    gridSize: {
      type: Number,
      required: true,
    },
    gridData: [String],
    clues: [clueSchema],
    hints: [hintSchema],
    pointsReward: {
      type: Number,
      default: 100,
    },
    estimatedTime: {
      type: Number,
      default: 15,
    },
    category: String,
  },
  { timestamps: true }
);

export default mongoose.model<ICrossword>('Crossword', crosswordSchema);
