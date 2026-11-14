import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/profile
router.get('/profile', authenticateToken, authController.getProfile);

export default router;
