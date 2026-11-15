import { Router } from 'express';
import * as libraryCardController from '../controllers/libraryCard.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Tat ca cac route deu can xac thuc JWT
router.use(authenticateToken);

// GET /api/library-cards - Lay danh sach tat ca the (librarian, admin)
router.get('/', requireRole(['librarian', 'admin']), libraryCardController.getAllLibraryCards);

// GET /api/library-cards/:id - Lay thong tin the theo ID (librarian, admin)
router.get('/:id', requireRole(['librarian', 'admin']), libraryCardController.getLibraryCardById);

// POST /api/library-cards - Tao the moi (librarian, admin)
router.post('/', requireRole(['librarian', 'admin']), libraryCardController.createLibraryCard);

// PUT /api/library-cards/:id - Cap nhat the (librarian, admin)
router.put('/:id', requireRole(['librarian', 'admin']), libraryCardController.updateLibraryCard);

// POST /api/library-cards/:id/renew - Gia han the (librarian, admin)
router.post('/:id/renew', requireRole(['librarian', 'admin']), libraryCardController.renewLibraryCard);

// DELETE /api/library-cards/:id - Xoa the (admin)
router.delete('/:id', requireRole(['admin']), libraryCardController.deleteLibraryCard);

export default router;
