/**
 * Clears all existing puzzles and crosswords from the DB,
 * then inserts the spec seed puzzle (daily-2026-01-24) in archived state.
 *
 * Run: ts-node src/seeds/clearPuzzles.ts
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

import mongoose from 'mongoose';
import { Puzzle } from '../models/Puzzle';

// ── Build gridData and solution from the spec §13.9 seed puzzle ──────────────
const SOLUTION: string[][] = [
  ['I','N','G','R','A','T','E','_','C','O','W'],
  ['N','_','_','_','_','_','O','_','_','_','_'],
  ['N','E','R','V','E','_','I','R','A','T','E'],
  ['G','_','_','_','_','_','W','_','_','_','S'],
  ['T','I','E','R','_','D','O','R','S','E','T'],
  ['R','_','_','_','S','_','_','_','N','_','_'],
  ['A','N','D','E','A','N','_','B','R','I','E'],
  ['I','_','_','_','O','_','_','_','U','_','O'],
  ['P','I','N','K','O','_','L','A','S','S','O'],
  ['S','_','_','_','N','_','_','_','N','_','L'],
  ['E','R','E','_','G','R','A','N','I','T','E'],
];

function buildSeedGridData(solution: string[][]) {
  const rows = solution.length;
  const cols = solution[0].length;

  // Build cells
  const cells: any[][] = [];
  for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      cells[r][c] = {
        row: r,
        col: c,
        isBlack: solution[r][c] === '_',
        number: null,
        acrossStart: false,
        downStart: false,
      };
    }
  }

  // Number cells (standard crossword scan: left→right, top→bottom)
  let num = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c].isBlack) continue;

      const leftBlack  = c === 0 || cells[r][c - 1].isBlack;
      const rightOpen  = c + 1 < cols && !cells[r][c + 1].isBlack;
      const topBlack   = r === 0 || cells[r - 1][c].isBlack;
      const belowOpen  = r + 1 < rows && !cells[r + 1][c].isBlack;

      const startsAcross = leftBlack && rightOpen;
      const startsDown   = topBlack  && belowOpen;

      if (startsAcross || startsDown) {
        cells[r][c].number      = num;
        cells[r][c].acrossStart = startsAcross;
        cells[r][c].downStart   = startsDown;
        num++;
      }
    }
  }

  return { rows, cols, cells };
}

const SEED_CLUES_ACROSS = [
  { number:1,  direction:'across', text:'Thankless type tearing around (7)',                        answer:'INGRATE', letterCount:'7', clueType:'ANAG', startRow:0,  startCol:0,  length:7, definitionStart:true,  indicatorWord:'tearing' },
  { number:5,  direction:'across', text:'Bully chases off wimp, to begin with (3)',                 answer:'COW',     letterCount:'3', clueType:'ACRO', startRow:0,  startCol:8,  length:3, definitionStart:false, indicatorWord:'to begin with' },
  { number:7,  direction:'across', text:'Audacity under review now and again (5)',                  answer:'NERVE',   letterCount:'5', clueType:'ALT',  startRow:2,  startCol:0,  length:5, definitionStart:true,  indicatorWord:'now and again' },
  { number:8,  direction:'across', text:'Pirate\'s not entirely mad (5)',                           answer:'IRATE',   letterCount:'5', clueType:'HID',  startRow:2,  startCol:6,  length:5, definitionStart:false, indicatorWord:'not entirely' },
  { number:9,  direction:'across', text:'Toiletry, every so often, is rank (4)',                    answer:'TIER',    letterCount:'4', clueType:'ALT',  startRow:4,  startCol:0,  length:4, definitionStart:false, indicatorWord:'every so often' },
  { number:10, direction:'across', text:'Sorted out where to see Jurassic Coast (6)',               answer:'DORSET',  letterCount:'6', clueType:'ANAG', startRow:4,  startCol:5,  length:6, definitionStart:false, indicatorWord:'sorted out' },
  { number:12, direction:'across', text:'Somewhat wan deaneries in the mountains (6)',              answer:'ANDEAN',  letterCount:'6', clueType:'HID',  startRow:6,  startCol:0,  length:6, definitionStart:false, indicatorWord:'somewhat' },
  { number:14, direction:'across', text:'Debriefs, including cheese (4)',                           answer:'BRIE',    letterCount:'4', clueType:'HID',  startRow:6,  startCol:7,  length:4, definitionStart:false, indicatorWord:'including' },
  { number:17, direction:'across', text:'Left-winger providing some Agitprop in Kosovo (5)',        answer:'PINKO',   letterCount:'5', clueType:'HID',  startRow:8,  startCol:0,  length:5, definitionStart:true,  indicatorWord:'some' },
  { number:18, direction:'across', text:'Rope ladder aboard ship seafarers observed at first (5)',  answer:'LASSO',   letterCount:'5', clueType:'CHAR', startRow:8,  startCol:6,  length:5, definitionStart:true,  indicatorWord:'' },
  { number:20, direction:'across', text:'Regularly wearied, before, before (3)',                    answer:'ERE',     letterCount:'3', clueType:'ALT',  startRow:10, startCol:0,  length:3, definitionStart:false, indicatorWord:'regularly' },
  { number:21, direction:'across', text:'Bananas gratiné, very hard (7)',                           answer:'GRANITE', letterCount:'7', clueType:'ANAG', startRow:10, startCol:4,  length:7, definitionStart:false, indicatorWord:'bananas' },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✓ Connected to MongoDB');

  // ── 1. Clear old crosswords collection ──────────────────────────────────────
  const Crossword = mongoose.connection.collection('crosswords');
  const deleted = await Crossword.deleteMany({});
  console.log(`✓ Cleared ${deleted.deletedCount} documents from crosswords`);

  // ── 2. Clear puzzles collection ──────────────────────────────────────────────
  const cleared = await Puzzle.deleteMany({});
  console.log(`✓ Cleared ${cleared.deletedCount} documents from puzzles`);

  // ── 3. Insert archived seed puzzle ───────────────────────────────────────────
  const { rows, cols, cells } = buildSeedGridData(SOLUTION);

  await Puzzle.create({
    slug: 'daily-2026-01-24',
    difficulty: 'intermediate',
    version: 1,
    isDraft: false,
    gridSize: 11,
    gridData: { rows, cols, cells },
    clues: SEED_CLUES_ACROSS,
    solution: SOLUTION,
    tricksUsed: ['ANAG', 'HID', 'ACRO', 'ALT', 'CHAR'],
    publishedAt: new Date('2026-01-24T00:30:00.000Z'), // 06:00 IST = 00:30 UTC
  });
  console.log('✓ Inserted archived seed puzzle: daily-2026-01-24');

  await mongoose.disconnect();
  console.log('✓ Done');
}

main().catch((err) => {
  console.error('❌ Clear failed:', err);
  process.exit(1);
});
