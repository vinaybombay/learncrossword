import { Router } from 'express';
import {
  getDailyPuzzle,
  getPuzzleArchive,
  getPuzzleBySlug,
} from '../controllers/puzzleController';

const router = Router();

// Order matters — /archive and /daily must come before /:slug
router.get('/daily',   getDailyPuzzle);
router.get('/archive', getPuzzleArchive);
router.get('/:slug',   getPuzzleBySlug);

export default router;
