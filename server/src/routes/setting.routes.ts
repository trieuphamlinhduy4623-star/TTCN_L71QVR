import { Router } from 'express';
import * as settingController from '../controllers/setting.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Tat ca routes can xac thuc JWT va role admin
router.use(authenticateToken);
router.use(requireRole(['admin']));

// GET /api/settings - Lay tat ca settings
router.get('/', settingController.getAllSettings);

// GET /api/settings/:key - Lay setting theo key
router.get('/:key', settingController.getSettingByKey);

// PUT /api/settings/:key - Cap nhat mot setting
router.put('/:key', settingController.updateSetting);

// POST /api/settings/batch - Cap nhat nhieu settings
router.post('/batch', settingController.updateMultipleSettings);

export default router;
