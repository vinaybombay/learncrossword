import cron from 'node-cron';
import { generatePuzzle } from '../seeds/generatePuzzles';

/**
 * Starts the automated puzzle generation schedule.
 * - Beginner: daily at 00:05 UTC
 * - Intermediate: weekly, Monday at 00:10 UTC
 * - Advanced: weekly, Monday at 00:15 UTC
 *
 * Assumes MongoDB is already connected when called.
 */
export function startPuzzleScheduler(): void {
  // ── Daily: Beginner ──────────────────────────────────────────────────────────
  cron.schedule('5 0 * * *', async () => {
    console.log('[cron] Generating daily beginner puzzle…');
    try {
      await generatePuzzle('beginner');
      console.log('[cron] ✓ beginner puzzle generated');
    } catch (err) {
      console.error('[cron] ✗ beginner puzzle failed:', err);
    }
  }, { timezone: 'UTC' });

  // ── Weekly Monday: Intermediate ──────────────────────────────────────────────
  cron.schedule('10 0 * * 1', async () => {
    console.log('[cron] Generating weekly intermediate puzzle…');
    try {
      await generatePuzzle('intermediate');
      console.log('[cron] ✓ intermediate puzzle generated');
    } catch (err) {
      console.error('[cron] ✗ intermediate puzzle failed:', err);
    }
  }, { timezone: 'UTC' });

  // ── Weekly Monday: Advanced ──────────────────────────────────────────────────
  cron.schedule('15 0 * * 1', async () => {
    console.log('[cron] Generating weekly advanced puzzle…');
    try {
      await generatePuzzle('advanced');
      console.log('[cron] ✓ advanced puzzle generated');
    } catch (err) {
      console.error('[cron] ✗ advanced puzzle failed:', err);
    }
  }, { timezone: 'UTC' });

  console.log('✓ Puzzle scheduler started (beginner daily · intermediate+advanced weekly on Mondays)');
}
