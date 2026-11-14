import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Tất cả các route đều cần xác thực JWT
router.use(authenticateToken);

// GET /api/categories - Lấy danh sách tất cả thể loại (tất cả user đã đăng nhập)
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id - Lấy thông tin thể loại theo ID (tất cả user đã đăng nhập)
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Tạo thể loại mới (chỉ librarian và admin)
router.post('/', requireRole(['librarian', 'admin']), categoryController.createCategory);

// PUT /api/categories/:id - Cập nhật thể loại (chỉ librarian và admin)
router.put('/:id', requireRole(['librarian', 'admin']), categoryController.updateCategory);

// DELETE /api/categories/:id - Xóa thể loại (librarian và admin)
router.delete('/:id', requireRole(['librarian', 'admin']), categoryController.deleteCategory);

export default router;
