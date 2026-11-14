import { Router } from 'express';
import type { Response } from 'express';
import type { AuthRequest } from '../types/index';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// GET /api/test/reader
router.get(
  '/reader',
  authenticateToken,
  requireRole('reader', 'librarian', 'admin'),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Chao mung reader!',
      data: {
        user: req.user,
        note: 'Ban co quyen truy cap endpoint nay',
      },
    });
  }
);

// GET /api/test/librarian
router.get(
  '/librarian',
  authenticateToken,
  requireRole('librarian', 'admin'),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Chao mung librarian!',
      data: {
        user: req.user,
        note: 'Chi thu thu va admin moi vao duoc day',
      },
    });
  }
);

// GET /api/test/admin
router.get(
  '/admin',
  authenticateToken,
  requireRole('admin'),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Chao mung admin!',
      data: {
        user: req.user,
        note: 'Chi admin moi vao duoc day',
      },
    });
  }
);

export default router;
