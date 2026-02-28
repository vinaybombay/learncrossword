import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/authenticate';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
