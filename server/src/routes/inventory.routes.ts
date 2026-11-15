import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Tat ca cac route deu can xac thuc JWT
router.use(authenticateToken);

// GET /api/inventory/stats - Thong ke ton kho (tat ca user)
router.get('/stats', inventoryController.getInventoryStats);

// GET /api/inventory - Danh sach ton kho (tat ca user)
router.get('/', inventoryController.getInventoryList);

// GET /api/inventory/low-stock - Sach sap het (tat ca user)
router.get('/low-stock', inventoryController.getLowStockBooks);

// POST /api/inventory/:id/add - Nhap them sach (librarian, admin)
router.post('/:id/add', requireRole(['librarian', 'admin']), inventoryController.addBookStock);

// PUT /api/inventory/:id/adjust - Dieu chinh so luong (librarian, admin)
router.put('/:id/adjust', requireRole(['librarian', 'admin']), inventoryController.adjustBookStock);

export default router;
