import { Router } from 'express';
import {
  getDailyPuzzle,
  getPuzzleArchive,
  getPuzzleBySlug,
} from '../controllers/puzzleController';
import {
  submitPuzzle,
  savePuzzleProgress,
  getPuzzleProgress,
} from '../controllers/puzzleProgressController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// ── Public puzzle endpoints ───────────────────────────────────────────────────
// Order matters — /archive and /daily must come before /:slug
router.get('/daily',   getDailyPuzzle);
router.get('/archive', getPuzzleArchive);

// ── Authenticated progress endpoints ─────────────────────────────────────────
// Must come before /:slug to avoid slug-matching "submit" or "progress"
router.post('/:slug/submit',   authenticate, submitPuzzle);
router.post('/:slug/progress', authenticate, savePuzzleProgress);
router.get('/:slug/progress',  authenticate, getPuzzleProgress);

// ── Public puzzle by slug ─────────────────────────────────────────────────────
router.get('/:slug', getPuzzleBySlug);

export default router;
