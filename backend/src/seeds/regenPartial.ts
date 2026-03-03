/**
 * Deletes and regenerates only the beginner and intermediate puzzles.
 * Run: ts-node src/seeds/regenPartial.ts
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

import mongoose from 'mongoose';
import Anthropic from '@anthropic-ai/sdk';
import { Puzzle, IClue, ClueType } from '../models/Puzzle';
import { Word } from '../models/Word';

// ── Import all helpers from generatePuzzles logic (duplicated here for isolation) ──
const CrosswordLayoutGenerator = require('crossword-layout-generator');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Re-export the full generatePuzzle function via dynamic import
async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✓ Connected to MongoDB');

  // Delete the bad puzzles
  const del = await mongoose.connection.collection('puzzles').deleteMany({
    slug: { $in: ['daily-2026-03-03', 'daily-2026-03-03-intermediate'] }
  });
  console.log(`✓ Deleted ${del.deletedCount} bad puzzles`);
  await mongoose.disconnect();

  console.log('\nNow run: npm run generate:puzzles:partial');
}
main().catch(console.error);
