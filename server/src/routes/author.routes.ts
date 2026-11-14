import { Router } from 'express';
import * as authorController from '../controllers/author.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Tất cả các route đều cần xác thực JWT
router.use(authenticateToken);

// GET /api/authors - Lấy danh sách tất cả tác giả (tất cả user đã đăng nhập)
router.get('/', authorController.getAllAuthors);

// GET /api/authors/:id - Lấy thông tin tác giả theo ID (tất cả user đã đăng nhập)
router.get('/:id', authorController.getAuthorById);

// POST /api/authors - Tạo tác giả mới (chỉ librarian và admin)
router.post('/', requireRole(['librarian', 'admin']), authorController.createAuthor);

// PUT /api/authors/:id - Cập nhật tác giả (chỉ librarian và admin)
router.put('/:id', requireRole(['librarian', 'admin']), authorController.updateAuthor);

// DELETE /api/authors/:id - Xóa tác giả (librarian và admin)
router.delete('/:id', requireRole(['librarian', 'admin']), authorController.deleteAuthor);

export default router;
