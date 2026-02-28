import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as crosswordController from '../controllers/crosswordController';

const router = Router();

router.get('/', crosswordController.getCrosswords);
router.get('/:id', crosswordController.getCrosswordById);
router.post('/:id/submit', authenticate, crosswordController.submitCrossword);
router.post('/:id/hints/:clueId/:level', authenticate, crosswordController.getHint);

export default router;
