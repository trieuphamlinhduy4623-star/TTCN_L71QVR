import { Router } from 'express';
import * as bookController from '../controllers/book.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Tat ca cac route deu can xac thuc JWT
router.use(authenticateToken);

// GET /api/books - Lay danh sach tat ca sach (tat ca user da dang nhap)
router.get('/', bookController.getAllBooks);

// GET /api/books/:id - Lay thong tin sach theo ID (tat ca user da dang nhap)
router.get('/:id', bookController.getBookById);

// POST /api/books - Them sach moi (librarian va admin)
router.post('/', requireRole(['librarian', 'admin']), bookController.createBook);

// PUT /api/books/:id - Cap nhat sach (librarian va admin)
router.put('/:id', requireRole(['librarian', 'admin']), bookController.updateBook);

// DELETE /api/books/:id - Xoa sach (librarian va admin)
router.delete('/:id', requireRole(['librarian', 'admin']), bookController.deleteBook);

export default router;
