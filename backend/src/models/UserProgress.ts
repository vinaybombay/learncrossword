import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  puzzleId: mongoose.Types.ObjectId;
  answers: Map<string, string>; // "row,col" -> letter (e.g. "0,3" -> "C")
  score: number;                // 0–100 percentage of correct cells
  hintsUsed: number;
  pointsEarned: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    puzzleId: {
      type: Schema.Types.ObjectId,
      ref: 'Puzzle',
      required: true,
    },
    answers: {
      type: Map,
      of: String,
      default: new Map(),
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

userProgressSchema.index({ userId: 1, puzzleId: 1 }, { unique: true });

export default mongoose.model<IUserProgress>('UserProgress', userProgressSchema);
