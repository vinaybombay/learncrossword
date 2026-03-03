import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });
import mongoose from 'mongoose';

const FALLBACK = ['Letters rearranged','Found partly','Parts combine','Cryptic clue'];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const puzzles = await mongoose.connection.collection('puzzles').find(
    { slug: { $in: ['daily-2026-03-03','daily-2026-03-03-intermediate','daily-2026-03-03-advanced'] } }
  ).toArray();

  for (const p of puzzles) {
    const real = p.clues.filter((c: any) => FALLBACK.every(f => !c.text.startsWith(f)));
    console.log(`\n=== ${p.slug} | ${p.gridData.rows}x${p.gridData.cols} | ${real.length}/${p.clues.length} real clues ===`);
    for (const c of p.clues) {
      const ok = FALLBACK.every((f: string) => !c.text.startsWith(f)) ? '✓' : '✗';
      console.log(` ${ok} ${c.number}${c.direction[0].toUpperCase()} [${c.clueType}] ${c.answer}: ${c.text}`);
    }
  }
  await mongoose.disconnect();
}
main().catch(console.error);
