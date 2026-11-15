import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticateToken);

// GET /api/users - Lay danh sach users (librarian, admin)
router.get('/', requireRole(['librarian', 'admin']), userController.getAllUsers);

// GET /api/users/without-card - Lay users chua co the (librarian, admin)
router.get('/without-card', requireRole(['librarian', 'admin']), userController.getUsersWithoutCard);

export default router;
