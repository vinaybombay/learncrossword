import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  crosswordId: mongoose.Types.ObjectId;
  answers: Map<number, string>; // clueNumber -> answer
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
    crosswordId: {
      type: Schema.Types.ObjectId,
      ref: 'Crossword',
      required: true,
    },
    answers: {
      type: Map,
      of: String,
      default: new Map(),
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

userProgressSchema.index({ userId: 1, crosswordId: 1 }, { unique: true });

export default mongoose.model<IUserProgress>('UserProgress', userProgressSchema);
