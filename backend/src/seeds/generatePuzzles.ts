/**
 * Puzzle generation pipeline for learncrossword.in
 *
 * Flow: select words → grid fill → assign clue types → Claude clue gen → QA → save
 * Run: ts-node src/seeds/generatePuzzles.ts
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

import mongoose from 'mongoose';
import Anthropic from '@anthropic-ai/sdk';
import { Puzzle, IClue, ClueType } from '../models/Puzzle';
import { Word } from '../models/Word';

const CrosswordLayoutGenerator = require('crossword-layout-generator');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Config ────────────────────────────────────────────────────────────────────

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const WORD_COUNTS: Record<Difficulty, number> = {
  beginner: 10,
  intermediate: 15,
  advanced: 20,
};

// Clue type distributions per difficulty (spec §4)
const DISTRIBUTIONS: Record<Difficulty, ClueType[]> = {
  beginner:     ['HID','HID','HID','HID','ACRO','ACRO','LAST','LAST','ALT','ALT','CHAR','CHAR'],
  intermediate: ['ANAG','ANAG','ANAG','HID','HID','HID','CHAR','CHAR','CHAR','ALT','ALT','ACRO','ACRO','SND','SND'],
  advanced:     ['ANAG','ANAG','ANAG','HID','HID','HIDR','CHAR','CHAR','CHAR','ALT','ALT','ACRO','ACRO','SND','SND','LAST','LAST','ANAG'],
};

// Indicator words per clue type (spec §13.8)
const INDICATORS: Record<ClueType, string[]> = {
  ANAG: ['arranged','mixed','tearing','wonky','scrambled','carelessly','unusual'],
  HID:  ['some','partly','somewhat','including','not entirely','a little'],
  HIDR: ['returns','returning','rejected','back','reversed'],
  ACRO: ['initially','leaders of','starters of','principally','intros in'],
  LAST: ['finally','ultimately','in the end','at last','closing'],
  ALT:  ['oddly','evenly','regularly','every so often','periodically'],
  SND:  ["we're told",'in the auditorium','announced','spoken of','reportedly'],
  CHAR: [''],   // no indicator for charade
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.v);
}

function pickIndicator(type: ClueType): string {
  const pool = INDICATORS[type];
  return pool[Math.floor(Math.random() * pool.length)];
}

function assignTypes(count: number, difficulty: Difficulty): ClueType[] {
  const pool = shuffle([...DISTRIBUTIONS[difficulty]]);
  const types: ClueType[] = [];
  for (let i = 0; i < count; i++) types.push(pool[i % pool.length]);
  return types;
}

// ── Word quality filter ────────────────────────────────────────────────────────

// Words that are crude, inappropriate, or too obscure for a general-audience puzzle
const WORD_BLOCKLIST = new Set([
  // Crude / body parts
  'ANUS','PENIS','VAGINA','VULVA','ARSE','TURD','FART','SHIT','PISS','COCK',
  'CUNT','FUCK','TWAT','WANK','KNOB','DONG','PRICK','BOLLOCK','BALLS','BONER',
  // Too dark / violent
  'DEBAUCH','RAPE','MURDER','SNUFF','GORE','SLUT','WHORE',
  // Identity terms that cause Claude preambles
  'LESBIAN','GAYNESS','QUEER','BISEX','TRANS',
  // Obscure dialectal / archaic / Scottish
  'URANIC','PAROTIC','RACON','LOUPING','DREE','AIN','ANE','TWAL','HAEN',
  'WAME','GIRN','BIRL','JUBE','SPAE','WICE','LOUR','UNCO','BRAW',
  // Botanical / medical jargon unlikely in crosswords
  'ARIL','ARUM','SEPAL','STAMEN','OVULE','PAROTIC','URANIC',
  // Physics / chemistry jargon
  'FERMION','BOSON','QUARK','MESON','HADRON',
  // Very unusual comparatives / non-words
  'REHI','MAUVER','MAUVER','LOUPER','GUSTIER',
  // Other obscure SCOWL entries
  'ISOBAR','TISANE','EYRE','REFOUND','DINAR','PADRONE',
  'RATLINE','LOUPING','HAILER','CANER','LIDAR','VARA',
  // Obscure biological / medical / art terms
  'CHORIA','MURINE','OSTEAL','KAOLIN','IMPASTO','PEMICAN',
  'ARIL','ARUM','SEPAL','STAMEN','OVULE',
]);

// Require a vowel in every word (avoids consonant-only blobs)
// and at least 2 unique letters (avoids AAA, BBB etc.)
function isQualityWord(word: string): boolean {
  if (WORD_BLOCKLIST.has(word)) return false;
  const hasVowel = /[AEIOU]/.test(word);
  const uniqueLetters = new Set(word.split('')).size;
  return hasVowel && uniqueLetters >= 2;
}

// ── Word selection ─────────────────────────────────────────────────────────────

async function selectWords(difficulty: Difficulty, count: number): Promise<string[]> {
  const tiers: Record<Difficulty, Difficulty[]> = {
    beginner:     ['beginner'],
    intermediate: ['beginner','intermediate'],
    advanced:     ['beginner','intermediate','advanced'],
  };
  const allowed = tiers[difficulty];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch a large sample so we have room to filter
  const words = await Word.aggregate([
    {
      $match: {
        difficulty: { $in: allowed },
        length: { $gte: 3, $lte: 9 },
        $or: [{ lastUsed: null }, { lastUsed: { $lt: thirtyDaysAgo } }],
      },
    },
    { $sample: { size: count * 6 } },
  ]);

  // Apply quality filter
  const filtered = words
    .map((w: any) => w.word as string)
    .filter(isQualityWord);

  if (filtered.length < count) {
    throw new Error(
      `Not enough quality words for ${difficulty}. Got ${filtered.length} after filtering, need ${count}.`
    );
  }

  return filtered.slice(0, count);
}

// ── Grid construction ──────────────────────────────────────────────────────────

interface PlacedWord {
  answer: string;
  startx: number;   // 1-indexed col
  starty: number;   // 1-indexed row
  orientation: 'across' | 'down';
  position: number; // generator clue number (unused — we renumber ourselves)
}

interface NumberedCell {
  number: number;
  row: number;
  col: number;
  acrossStart: boolean;
  downStart: boolean;
}

function buildGridFromLayout(layout: any) {
  const table: string[][] = layout.table;           // '-' = black, letter = white
  const rows = layout.rows as number;
  const cols = layout.cols as number;
  const placed: PlacedWord[] = layout.result.filter(
    (w: any) => w.orientation !== 'none'
  );

  // Build cells
  const cells: any[][] = [];
  for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      cells[r][c] = {
        row: r, col: c,
        isBlack: table[r][c] === '-',
        number: null,
        acrossStart: false,
        downStart: false,
      };
    }
  }

  // Standard crossword numbering (left→right, top→bottom)
  let num = 1;
  const numbered: NumberedCell[] = [];
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
        numbered.push({ number: num, row: r, col: c, acrossStart: startsAcross, downStart: startsDown });
        num++;
      }
    }
  }

  // Build solution grid
  const solution: string[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (cells[r][c].isBlack ? '_' : table[r][c]))
  );

  return { rows, cols, cells, numbered, placed, solution };
}

// ── Claude clue generation ─────────────────────────────────────────────────────

interface ClueRequest {
  number: number;
  direction: string;
  answer: string;
  clueType: ClueType;
  indicatorWord: string;
}

interface GeneratedClue {
  number: number;
  direction: string;
  text: string;
  definitionStart: boolean;
}

async function generateCluesWithClaude(
  requests: ClueRequest[]
): Promise<GeneratedClue[]> {
  const list = requests
    .map(
      (r, i) =>
        `${i + 1}. Answer: ${r.answer} (${r.answer.length} letters) | ` +
        `Clue #${r.number} ${r.direction} | ` +
        `Type: ${r.clueType}` +
        (r.indicatorWord ? ` | Indicator to use: "${r.indicatorWord}"` : '')
    )
    .join('\n');

  const prompt = `You are a professional British cryptic crossword setter (Guardian style).
Generate one cryptic clue for EVERY answer listed below. Return ALL clues in a single JSON array.

ANSWERS:
${list}

CLUE TYPE GUIDE:
- ANAG: Rearrange the answer letters; signal word indicates scrambling (e.g. "arranged", "mixed"). The fodder must be an anagram of the answer.
- HID:  Answer is hidden consecutively inside the clue surface. The indicator (e.g. "some", "partly") marks this. The answer letters must literally appear as a substring of the clue text.
- HIDR: Answer is hidden backwards inside the clue. The reversed answer must appear as a substring of the clue text.
- ACRO: Take the first letter of each of several consecutive words to spell the answer. The indicator (e.g. "initially") marks which words.
- LAST: Take the last letter of each of several consecutive words to spell the answer. The indicator (e.g. "finally") marks which words.
- ALT:  Take alternate letters (odd or even positions) of a word or phrase to spell the answer. The indicator (e.g. "oddly", "regularly") marks this.
- SND:  The answer sounds like another word. The indicator (e.g. "we're told", "announced") signals this.
- CHAR: Combine two or more word parts side-by-side to make the answer. No single indicator needed; the surface shows the parts.

STRICT RULES:
1. Definition at START or END only (never in the middle).
2. Use the specified indicator word where given (include it verbatim).
3. Surface reading must be natural, grammatical English.
4. Do NOT include the answer word in the clue text.
5. For HID clues: the answer letters MUST appear as a consecutive substring in the clue (before the letter count).
6. For HIDR clues: the reversed answer MUST appear as a consecutive substring in the clue.
7. Letter count in parentheses at the very end, e.g. (5) or (3,4).

OUTPUT: A valid JSON array only — no explanation, no markdown fences.
[
  { "number": <n>, "direction": "<across|down>", "text": "<clue> (<count>)", "definitionStart": <true|false> },
  ...
]`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: 'You are a JSON-only API. You MUST output a valid JSON array as your ENTIRE response. No analysis, no reasoning, no preamble, no explanation. Only the JSON array.',
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = (response.content[0] as Anthropic.TextBlock).text;

  // Strip markdown fences
  const stripped = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Try to find a JSON array — use the LAST (most complete) occurrence in case there's a preamble
  const allMatches = [...stripped.matchAll(/\[[\s\S]*?\]/gs)];
  const longestMatch = allMatches.sort((a, b) => b[0].length - a[0].length)[0];

  if (!longestMatch) {
    console.warn('  ⚠  Raw Claude response (first 400 chars):', raw.substring(0, 400));
    throw new Error('Claude response contained no JSON array');
  }

  try {
    return JSON.parse(longestMatch[0]) as GeneratedClue[];
  } catch {
    // Fallback: find any parseable JSON array in the text
    const fallbackMatch = stripped.match(/\[[\s\S]*\]/);
    if (fallbackMatch) return JSON.parse(fallbackMatch[0]) as GeneratedClue[];
    console.warn('  ⚠  Raw Claude response (first 400 chars):', raw.substring(0, 400));
    throw new Error('Failed to parse JSON from Claude response');
  }
}

// ── QA validation ──────────────────────────────────────────────────────────────

function validateClue(
  text: string,
  answer: string,
  clueType: ClueType
): { pass: boolean; reason?: string } {
  // 1. Must have letter count at end
  const countMatch = text.match(/\((\d+(?:,\d+)*)\)$/);
  if (!countMatch) return { pass: false, reason: 'Missing letter count' };

  // 2. Letter count must match answer length
  const total = countMatch[1].split(',').reduce((s, n) => s + parseInt(n), 0);
  if (total !== answer.length)
    return { pass: false, reason: `Count ${total} ≠ answer length ${answer.length}` };

  // 3. Answer must not appear verbatim in clue (except HID/HIDR where it should)
  const upperText   = text.toUpperCase();
  const upperAnswer = answer.toUpperCase();

  if (clueType === 'HID') {
    if (!upperText.includes(upperAnswer))
      return { pass: false, reason: 'HID: answer not found as substring in clue' };
  } else if (clueType === 'HIDR') {
    const rev = upperAnswer.split('').reverse().join('');
    if (!upperText.includes(rev))
      return { pass: false, reason: 'HIDR: reversed answer not found as substring in clue' };
  } else {
    if (upperText.includes(upperAnswer))
      return { pass: false, reason: 'Answer exposed in clue' };
  }

  return { pass: true };
}

// ── Retry with template fallback ───────────────────────────────────────────────

function templateFallback(answer: string, clueType: ClueType): string {
  const n = answer.length;
  switch (clueType) {
    case 'ANAG': return `Letters rearranged make ${answer.toLowerCase()} (${n})`;
    case 'HID':  return `Found partly in the ${answer.toLowerCase()} arrangement (${n})`;
    case 'CHAR': return `Parts combine for this result (${n})`;
    default:     return `Cryptic clue for ${answer.toLowerCase()} (${n})`;
  }
}

// ── Main puzzle generator ──────────────────────────────────────────────────────

async function generatePuzzle(difficulty: Difficulty) {
  console.log(`\n🎯  Generating ${difficulty.toUpperCase()} puzzle...`);

  // 1. Select words
  console.log('  📚 Selecting words...');
  const words = await selectWords(difficulty, WORD_COUNTS[difficulty]);
  console.log(`  ✓  ${words.length} words: ${words.join(', ')}`);

  // 2. Grid fill
  console.log('  🔲 Filling grid...');
  const input = words.map((w) => ({ answer: w, clue: '' }));
  const layout = CrosswordLayoutGenerator.generateLayout(input);
  const { rows, cols, cells, numbered, placed, solution } = buildGridFromLayout(layout);
  console.log(`  ✓  Grid: ${rows}×${cols}, ${placed.length}/${words.length} words placed`);

  // 3. Assign clue types
  const typePool = assignTypes(numbered.length * 2, difficulty); // over-allocate
  let typeIndex  = 0;

  // 4. Build clue requests
  const requests: ClueRequest[] = [];

  for (const nc of numbered) {
    if (nc.acrossStart) {
      const w = placed.find(
        (p) => p.orientation === 'across' && p.starty - 1 === nc.row && p.startx - 1 === nc.col
      );
      if (w) {
        const type = typePool[typeIndex++ % typePool.length];
        requests.push({
          number: nc.number, direction: 'across',
          answer: w.answer, clueType: type,
          indicatorWord: pickIndicator(type),
        });
      }
    }
    if (nc.downStart) {
      const w = placed.find(
        (p) => p.orientation === 'down' && p.starty - 1 === nc.row && p.startx - 1 === nc.col
      );
      if (w) {
        const type = typePool[typeIndex++ % typePool.length];
        requests.push({
          number: nc.number, direction: 'down',
          answer: w.answer, clueType: type,
          indicatorWord: pickIndicator(type),
        });
      }
    }
  }

  console.log(`  ✓  ${requests.length} clue requests prepared`);

  // 5. Generate clues with Claude
  console.log('  🤖 Calling Claude for clues...');
  let generated: GeneratedClue[] = [];
  try {
    generated = await generateCluesWithClaude(requests);
    console.log(`  ✓  Claude returned ${generated.length} clues`);
  } catch (err: any) {
    const msg = err?.error?.error?.message || err?.message || String(err);
    console.warn(`  ⚠  Claude generation failed: ${msg}`);
    if (msg.includes('credit') || msg.includes('billing')) {
      throw new Error(`Anthropic API: ${msg}\n→ Add credits at https://console.anthropic.com/billing`);
    }
  }

  // 6. Build final clue list with QA + retry
  const finalClues: IClue[] = [];
  let qaPassed = 0;
  let qaFailed = 0;
  let usedFallback = 0;

  for (const req of requests) {
    const gen = generated.find(
      (g) => g.number === req.number && g.direction === req.direction
    );

    let text    = gen?.text ?? '';
    let defStart = gen?.definitionStart ?? true;
    let qa      = validateClue(text, req.answer, req.clueType);

    // Retry up to 2 times if QA fails
    if (!qa.pass && generated.length > 0) {
      console.log(`    ↩  QA fail (${qa.reason}) for ${req.answer} — retrying...`);
      try {
        const retried = await generateCluesWithClaude([req]);
        text     = retried[0]?.text ?? text;
        defStart = retried[0]?.definitionStart ?? defStart;
        qa       = validateClue(text, req.answer, req.clueType);
      } catch { /* ignore retry error */ }
    }

    if (!qa.pass) {
      // Use template fallback
      text = templateFallback(req.answer, req.clueType);
      defStart = true;
      usedFallback++;
      qaFailed++;
      console.warn(`    ⚠  Fallback used for ${req.answer} (${req.clueType})`);
    } else {
      qaPassed++;
    }

    finalClues.push({
      number:         req.number,
      direction:      req.direction as 'across' | 'down',
      text,
      answer:         req.answer,
      letterCount:    String(req.answer.length),
      startRow:       numbered.find((n) => n.number === req.number)!.row,
      startCol:       numbered.find((n) => n.number === req.number)!.col,
      length:         req.answer.length,
      clueType:       req.clueType,
      definitionStart: defStart,
      indicatorWord:  req.indicatorWord,
    });
  }

  console.log(
    `  ✅ QA: ${qaPassed} passed, ${qaFailed} failed` +
    (usedFallback ? ` (${usedFallback} templates used)` : '')
  );

  // 7. Save puzzle
  const today   = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const suffix  = difficulty === 'beginner' ? '' : `-${difficulty}`;
  const slug    = `daily-${dateStr}${suffix}`;

  const tricksUsed = [...new Set(finalClues.map((c) => c.clueType))];

  const puzzle = await Puzzle.create({
    slug,
    difficulty,
    version: 1,
    isDraft: false,
    gridSize: Math.max(rows, cols),
    gridData: { rows, cols, cells },
    clues: finalClues,
    solution,
    tricksUsed,
    publishedAt: today,
  });

  // Mark used words
  const usedWords = placed.map((p) => p.answer);
  await Word.updateMany(
    { word: { $in: usedWords } },
    { $set: { lastUsed: today }, $inc: { useCount: 1 } }
  );

  console.log(`  💾 Saved: ${puzzle.slug} | ${rows}×${cols} | ${finalClues.length} clues | tricks: ${tricksUsed.join(', ')}`);
  return puzzle;
}

// ── Entry point ────────────────────────────────────────────────────────────────

async function main() {
  // Support: ts-node generatePuzzles.ts --only beginner,intermediate
  const onlyArg = process.argv.find(a => a.startsWith('--only'));
  const targets: Difficulty[] = onlyArg
    ? (onlyArg.split('=')[1] ?? onlyArg.split(' ')[1] ?? '').split(',') as Difficulty[]
    : ['beginner', 'intermediate', 'advanced'];

  console.log(`🚀 Puzzle generation starting (${targets.join(', ')})...\n`);
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✓ Connected to MongoDB');

  try {
    const results = [];
    for (const diff of targets) {
      results.push(await generatePuzzle(diff));
    }
    console.log(`\n✅ ${results.length} puzzle(s) generated:`);
    results.forEach(p => console.log(`   ${p.slug}  (${p.gridData.rows}×${p.gridData.cols})`));
  } catch (err) {
    console.error('\n❌ Generation failed:', err);
    throw err;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
