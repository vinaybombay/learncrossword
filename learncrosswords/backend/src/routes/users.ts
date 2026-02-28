import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/:id/progress', authenticate, userController.getUserProgress);
router.get('/:id/stats', authenticate, userController.getUserStats);
router.put('/:id/profile', authenticate, userController.updateUserProfile);

export default router;
