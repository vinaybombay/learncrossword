import mongoose, { Schema, Document } from 'mongoose';

export interface ICell {
  row: number;
  col: number;
  isBlack: boolean;
  number: number | null;
  acrossStart: boolean;
  downStart: boolean;
}

export interface IGridData {
  rows: number;
  cols: number;
  cells: ICell[][];
}

export type ClueType = 'ANAG' | 'HID' | 'HIDR' | 'ACRO' | 'LAST' | 'ALT' | 'SND' | 'CHAR';

export interface IClue {
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  letterCount: string;
  startRow: number;
  startCol: number;
  length: number;
  clueType: ClueType;
  definitionStart: boolean;
  indicatorWord: string;
}

export interface IPuzzle extends Document {
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  version: number;
  isDraft: boolean;
  gridSize: number;
  gridData: IGridData;
  clues: IClue[];
  solution: string[][];
  tricksUsed: string[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CellSchema = new Schema<ICell>(
  {
    row: Number,
    col: Number,
    isBlack: Boolean,
    number: { type: Number, default: null },
    acrossStart: { type: Boolean, default: false },
    downStart: { type: Boolean, default: false },
  },
  { _id: false }
);

const GridDataSchema = new Schema<IGridData>(
  {
    rows: Number,
    cols: Number,
    cells: { type: [[CellSchema]], default: [] },
  },
  { _id: false }
);

const ClueSchema = new Schema<IClue>(
  {
    number: Number,
    direction: { type: String, enum: ['across', 'down'] },
    text: String,
    answer: String,
    letterCount: String,
    startRow: Number,
    startCol: Number,
    length: Number,
    clueType: {
      type: String,
      enum: ['ANAG', 'HID', 'HIDR', 'ACRO', 'LAST', 'ALT', 'SND', 'CHAR'],
    },
    definitionStart: Boolean,
    indicatorWord: String,
  },
  { _id: false }
);

const PuzzleSchema = new Schema<IPuzzle>(
  {
    slug: { type: String, unique: true, required: true, index: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    version: { type: Number, default: 1 },
    isDraft: { type: Boolean, default: true },
    gridSize: Number,
    gridData: GridDataSchema,
    clues: [ClueSchema],
    solution: [[String]],
    tricksUsed: [String],
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Puzzle = mongoose.model<IPuzzle>('Puzzle', PuzzleSchema);
