import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

import { uploadMiddleware } from '../utils/upload';

const router = Router();

// Protect all admin routes with authentication
router.use(requireAuth);

// Dashboard - Accessible by ADMIN and FACULTY
router.get('/dashboard', requireRole(['ADMIN', 'FACULTY']), AdminController.getDashboard);

// Notice Management - View, Upload, Create, Edit, Publish, Delete
router.get('/notices', requireRole(['ADMIN', 'FACULTY']), AdminController.getNotices);
router.get('/notices/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.getNoticeById);
router.post('/notices', requireRole(['ADMIN', 'FACULTY']), AdminController.createNotice);
router.post('/notices/upload', requireRole(['ADMIN', 'FACULTY']), uploadMiddleware.single('file'), AdminController.uploadNotice);
router.patch('/notices/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateNotice);
router.put('/notices/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateNotice);
router.post('/notices/:id/publish', requireRole(['ADMIN', 'FACULTY']), AdminController.publishNotice);
router.delete('/notices/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.deleteNotice);

// Event Management
router.get('/events', requireRole(['ADMIN', 'FACULTY']), AdminController.getEvents);
router.post('/events', requireRole(['ADMIN', 'FACULTY']), AdminController.createEvent);
router.patch('/events/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateEvent);
router.put('/events/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateEvent);
router.delete('/events/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.deleteEvent);
router.post('/events/:id/publish', requireRole(['ADMIN', 'FACULTY']), AdminController.publishEvent);

// Audit Logs - Strictly ADMIN only
router.get('/audit', requireRole(['ADMIN']), AdminController.getAuditLogs);

export default router;
