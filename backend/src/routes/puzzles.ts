import { Router } from 'express';
import rateLimit from 'express-rate-limit';
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

/** Puzzle submission: 30 submissions / hour per IP */
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Submission limit reached, please try again in an hour.' },
});

const router = Router();

// ── Public puzzle endpoints ───────────────────────────────────────────────────
// Order matters — /archive and /daily must come before /:slug
router.get('/daily',   getDailyPuzzle);
router.get('/archive', getPuzzleArchive);

// ── Authenticated progress endpoints ─────────────────────────────────────────
// Must come before /:slug to avoid slug-matching "submit" or "progress"
router.post('/:slug/submit',   authenticate, submitLimiter, submitPuzzle);
router.post('/:slug/progress', authenticate, savePuzzleProgress);
router.get('/:slug/progress',  authenticate, getPuzzleProgress);

// ── Public puzzle by slug ─────────────────────────────────────────────────────
router.get('/:slug', getPuzzleBySlug);

export default router;
