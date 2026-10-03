import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

import { uploadMiddleware } from '../utils/upload';

const router = Router();

// Protect all admin routes with authentication
router.use(requireAuth);

// Dashboard - Accessible by ADMIN and FACULTY
router.get('/dashboard', requireRole(['ADMIN', 'FACULTY']), AdminController.getDashboard);

// Notice Management - Upload, Edit, Publish
router.post('/notices/upload', requireRole(['ADMIN', 'FACULTY']), uploadMiddleware.single('file'), AdminController.uploadNotice);
router.put('/notices/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateNotice);
router.post('/notices/:id/publish', requireRole(['ADMIN', 'FACULTY']), AdminController.publishNotice);

// Event Management
router.post('/events', requireRole(['ADMIN', 'FACULTY']), AdminController.createEvent);
router.post('/events/:id/publish', requireRole(['ADMIN', 'FACULTY']), AdminController.publishEvent);

// Audit Logs - Strictly ADMIN only
router.get('/audit', requireRole(['ADMIN']), AdminController.getAuditLogs);

export default router;
