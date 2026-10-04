import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Enforce authentication on all /api endpoints
router.use(requireAuth);

router.get('/dashboard', StudentController.getDashboard);

// -------------------------------------------------------------
// NOTICES RBAC & ACCESS CONTROL
// Read: Authenticated users (students filtered by audience & PUBLISHED)
// Write/Edit/Delete/Publish: Strictly ADMIN and FACULTY only (403 for students)
// -------------------------------------------------------------
router.get('/notices', StudentController.getNotices);
router.get('/notices/:id', StudentController.getNoticeById);
router.post('/notices', requireRole(['ADMIN', 'FACULTY']), AdminController.createNotice);
router.patch('/notices/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateNotice);
router.put('/notices/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateNotice);
router.delete('/notices/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.deleteNotice);
router.post('/notices/:id/publish', requireRole(['ADMIN', 'FACULTY']), AdminController.publishNotice);

router.get('/deadlines', StudentController.getDeadlines);

// -------------------------------------------------------------
// EVENTS RBAC & ACCESS CONTROL
// Read: Authenticated users (students filtered to PUBLISHED)
// Write/Edit/Delete/Publish: Strictly ADMIN and FACULTY only (403 for students)
// -------------------------------------------------------------
router.get('/events', StudentController.getEvents);
router.get('/events/:id', StudentController.getEventById);
router.post('/events', requireRole(['ADMIN', 'FACULTY']), AdminController.createEvent);
router.patch('/events/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateEvent);
router.put('/events/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.updateEvent);
router.delete('/events/:id', requireRole(['ADMIN', 'FACULTY']), AdminController.deleteEvent);
router.post('/events/:id/publish', requireRole(['ADMIN', 'FACULTY']), AdminController.publishEvent);

// Event Registrations (Strictly Student-facing actions - Admin & Faculty are prohibited)
router.post('/events/:id/register', requireRole(['STUDENT']), StudentController.registerForEvent);
router.delete('/events/:id/register', requireRole(['STUDENT']), StudentController.cancelRegistration);

// In-App Notifications
router.get('/notifications', StudentController.getNotifications);
router.patch('/notifications/:id/read', StudentController.markNotificationRead);
router.post('/notifications/read-all', StudentController.markAllNotificationsRead);

export default router;
