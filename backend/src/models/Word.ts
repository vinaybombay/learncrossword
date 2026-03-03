import mongoose, { Schema, Document } from 'mongoose';

export interface IWord extends Document {
  word: string;
  length: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pos: 'noun' | 'verb' | 'adjective' | 'adverb';
  lastUsed: Date | null;
  useCount: number;
}

const WordSchema = new Schema<IWord>({
  word: { type: String, unique: true, required: true, uppercase: true },
  length: { type: Number, required: true, index: true },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true,
  },
  pos: {
    type: String,
    enum: ['noun', 'verb', 'adjective', 'adverb'],
    required: true,
  },
  lastUsed: { type: Date, default: null },
  useCount: { type: Number, default: 0 },
});

export const Word = mongoose.model<IWord>('Word', WordSchema);
