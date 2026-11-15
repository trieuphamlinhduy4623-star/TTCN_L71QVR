import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticateToken);

// GET /api/users/without-card - Lay users chua co the (librarian, admin) - PHAI DAT TRUOC /:id
router.get('/without-card', requireRole(['librarian', 'admin']), userController.getUsersWithoutCard);

// GET /api/users - Lay danh sach users (admin)
router.get('/', requireRole(['admin']), userController.getAllUsers);

// GET /api/users/:id - Lay user theo ID (admin)
router.get('/:id', requireRole(['admin']), userController.getUserById);

// POST /api/users - Tao user moi (admin)
router.post('/', requireRole(['admin']), userController.createUser);

// PUT /api/users/:id - Cap nhat user (admin)
router.put('/:id', requireRole(['admin']), userController.updateUser);

// POST /api/users/:id/reset-password - Reset password (admin)
router.post('/:id/reset-password', requireRole(['admin']), userController.resetPassword);

// DELETE /api/users/:id - Vo hieu hoa user (admin)
router.delete('/:id', requireRole(['admin']), userController.deactivateUser);

export default router;
