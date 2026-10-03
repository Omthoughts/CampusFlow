import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', StudentController.getDashboard);
router.get('/notices', StudentController.getNotices);
router.get('/notices/:id', StudentController.getNoticeById);
router.get('/deadlines', StudentController.getDeadlines);
router.get('/events', StudentController.getEvents);
router.get('/events/:id', StudentController.getEventById);
router.post('/events/:id/register', StudentController.registerForEvent);
router.delete('/events/:id/register', StudentController.cancelRegistration);

export default router;
