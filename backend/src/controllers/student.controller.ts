import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sharedStore } from '../services/store.service';

function buildNoticeAudienceWhere(user: any) {
  if (user?.role === 'ADMIN' || user?.role === 'FACULTY') {
    return {
      status: 'PUBLISHED' as const,
    };
  }

  const deptStrings = [
    user?.departmentId, 
    user?.department?.code, 
    user?.department?.name,
    user?.department?.id
  ].filter(Boolean) as string[];

  const deptCondition = deptStrings.length > 0 
    ? { OR: [{ departmentId: null }, { departmentId: { in: deptStrings } }] }
    : { departmentId: null };

  const audienceFilter: any = {
    AND: [
      deptCondition,
      user?.year ? { OR: [{ year: null }, { year: user.year }] } : { year: null },
      user?.division ? { OR: [{ division: null }, { division: user.division }] } : { division: null },
      user?.batch ? { OR: [{ batch: null }, { batch: user.batch }] } : { batch: null },
    ]
  };

  return {
    status: 'PUBLISHED' as const,
    OR: [
      { audiences: { none: {} } },
      { audiences: { some: audienceFilter } },
    ]
  };
}

export class StudentController {
  
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      
      const noticeWhere = buildNoticeAudienceWhere(user);
      const notices = await prisma.notice.findMany({
        where: noticeWhere,
        include: { summary: true, audiences: true, attachments: true },
        orderBy: { publishedAt: 'desc' },
        take: 5
      });

      const deadlines = await prisma.deadline.findMany({
        where: {
          status: 'PUBLISHED',
          dueAt: { gte: new Date() }
        },
        orderBy: { dueAt: 'asc' },
        take: 3
      });

      const events = await prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          date: { gte: new Date() }
        },
        orderBy: { date: 'asc' },
        take: 3
      });

      res.status(200).json({
        prioritySummary: notices,
        deadlines,
        notices,
        events,
        unreadCount: 0 // Mock for now
      });
    } catch (e: any) {
      if (e?.name === 'PrismaClientInitializationError' || e?.message?.includes("Can't reach database")) {
        return res.status(200).json({
          prioritySummary: [
            { id: '1', title: 'CIE-I Exam Timetable Released', date: '2026-10-02', priority: 'URGENT' },
          ],
          deadlines: [
            { id: '1', title: 'Submit Assignment 1', dueAt: '2026-10-05T23:59:00', type: 'SUBMISSION', status: 'upcoming' },
          ],
          notices: [
            { id: '1', title: 'CIE-I Exam Timetable Released', date: '2026-10-02', priority: 'URGENT' },
          ],
          events: [
            { id: '1', title: 'Tech Symposium 2026', date: '2026-10-15T10:00:00', venue: 'Main Auditorium' },
          ],
          unreadCount: 0
        });
      }
      next(e);
    }
  }

  static async getNotices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const noticeWhere = buildNoticeAudienceWhere(user);
      const notices = await prisma.notice.findMany({
        where: noticeWhere,
        include: { summary: true, audiences: true, attachments: true },
        orderBy: { publishedAt: 'desc' }
      });
      res.status(200).json({ data: notices, total: notices.length });
    } catch (e: any) {
      if (e?.name === 'PrismaClientInitializationError' || e?.message?.includes("Can't reach database")) {
        const notices = sharedStore.getPublishedNotices();
        return res.status(200).json({
          data: notices,
          total: notices.length
        });
      }
      next(e);
    }
  }

  static async getNoticeById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      try {
        const notice = await prisma.notice.findUnique({
          where: { id },
          include: { summary: true, audiences: true, attachments: true, author: { select: { name: true } } }
        });
        if (notice) {
          if (req.user?.role === 'STUDENT' && notice.status !== 'PUBLISHED') {
            throw new AppError('Notice not found', 404);
          }
          return res.status(200).json({
            success: true,
            data: notice,
            ...notice
          });
        }
      } catch (dbErr) {
        if (dbErr instanceof AppError) throw dbErr;
      }

      const stored = sharedStore.getNotice(id);
      if (stored) {
        if (req.user?.role === 'STUDENT' && stored.status !== 'PUBLISHED') {
          throw new AppError('Notice not found', 404);
        }
        return res.status(200).json({
          success: true,
          data: stored,
          ...stored,
          author: { name: stored.authorName || 'System Admin' },
          attachments: []
        });
      }

      throw new AppError('Notice not found', 404);
    } catch (e) {
      next(e);
    }
  }

  static async getDeadlines(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deadlines = await prisma.deadline.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { dueAt: 'asc' }
      });
      res.status(200).json({ data: deadlines });
    } catch (e: any) {
      if (e?.name === 'PrismaClientInitializationError' || e?.message?.includes("Can't reach database")) {
        return res.status(200).json({
          data: [
            { 
              id: '1', 
              title: 'Submit Assignment 1', 
              description: 'First assignment for Database Management Systems',
              dueAt: '2026-10-05T23:59:00Z', 
              type: 'SUBMISSION', 
              subject: 'DBMS',
              status: 'upcoming' 
            }
          ]
        });
      }
      next(e);
    }
  }

  static async getEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await prisma.event.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          _count: { select: { registrations: true } },
          registrations: { where: { userId: req.user!.id } }
        },
        orderBy: { date: 'asc' }
      });
      
      const mapped = events.map(e => ({
        ...e,
        registeredCount: e._count.registrations,
        isRegistered: e.registrations.length > 0
      }));
      res.status(200).json({ data: mapped });
    } catch (e: any) {
      if (e?.name === 'PrismaClientInitializationError' || e?.message?.includes("Can't reach database")) {
        const events = sharedStore.getPublishedEvents().map(ev => ({
          ...ev,
          registeredCount: ev.registeredCount || 0,
          isRegistered: sharedStore.isUserRegistered(ev.id, req.user!.id)
        }));
        return res.status(200).json({ data: events });
      }
      next(e);
    }
  }

  static async getEventById(req: AuthRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          _count: { select: { registrations: true } },
          registrations: { where: { userId: req.user!.id } }
        }
      });
      if (!event) throw new AppError('Event not found', 404);
      if (req.user?.role === 'STUDENT' && event.status !== 'PUBLISHED') {
        throw new AppError('Event not found', 404);
      }
      
      res.status(200).json({
        ...event,
        registeredCount: event._count.registrations,
        isRegistered: event.registrations.length > 0
      });
    } catch (e: any) {
      if (e?.name === 'PrismaClientInitializationError' || e?.message?.includes("Can't reach database")) {
        const ev = sharedStore.getEvent(id);
        if (!ev) return next(new AppError('Event not found', 404));
        if (req.user?.role === 'STUDENT' && ev.status !== 'PUBLISHED') {
          return next(new AppError('Event not found', 404));
        }
        return res.status(200).json({
          ...ev,
          registeredCount: ev.registeredCount || 0,
          isRegistered: sharedStore.isUserRegistered(ev.id, req.user!.id)
        });
      }
      next(e);
    }
  }

  static async registerForEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'STUDENT') {
        throw new AppError('Only students are permitted to register for events', 403, 'FORBIDDEN');
      }

      const { id } = req.params;
      const userId = req.user!.id;

      await prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({
          where: { id },
          include: { _count: { select: { registrations: true } } }
        });

        if (!event) throw new AppError('Event not found', 404);
        if (event.status !== 'PUBLISHED') throw new AppError('Event not active', 400);
        
        if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
          throw new AppError('Registration closed', 422, 'REGISTRATION_CLOSED');
        }

        if (event.capacity && event._count.registrations >= event.capacity) {
          throw new AppError('Event is full', 409, 'EVENT_FULL');
        }

        const existing = await tx.registration.findUnique({
          where: { eventId_userId: { eventId: id, userId } }
        });

        if (existing) {
          throw new AppError('Already registered', 409, 'ALREADY_REGISTERED');
        }

        await tx.registration.create({
          data: { eventId: id, userId }
        });
      });

      res.status(200).json({ success: true });
    } catch (e: any) {
      if (e instanceof AppError) {
        return next(e);
      }
      if (e?.name === 'PrismaClientInitializationError' || e?.message?.includes("Can't reach database")) {
        const registered = sharedStore.registerEvent(req.params.id, req.user!.id);
        if (!registered) {
          return next(new AppError('Already registered', 409, 'ALREADY_REGISTERED'));
        }
        return res.status(200).json({ success: true, message: 'Registration recorded (dev mode)' });
      }
      next(e);
    }
  }

  static async cancelRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'STUDENT') {
        throw new AppError('Only students are permitted to manage event registrations', 403, 'FORBIDDEN');
      }

      const { id } = req.params;
      const userId = req.user!.id;

      await prisma.registration.delete({
        where: { eventId_userId: { eventId: id, userId } }
      });

      res.status(200).json({ success: true });
    } catch (e: any) {
      if (e instanceof AppError) {
        return next(e);
      }
      if (e?.name === 'PrismaClientInitializationError' || e?.message?.includes("Can't reach database")) {
        sharedStore.cancelEventRegistration(req.params.id, req.user!.id);
        return res.status(200).json({ success: true, message: 'Registration cancelled (dev mode)' });
      }
      next(e);
    }
  }

  static async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      res.status(200).json({ data: notifications });
    } catch (e: any) {
      if (e?.name === 'PrismaClientInitializationError' || e?.message?.includes("Can't reach database")) {
        return res.status(200).json({
          data: [
            {
              id: 'notif-1',
              type: 'NOTICE',
              title: 'CIE-I Exam Timetable Released',
              body: 'Timetable announced for FY MCA. Please check your schedule and exam hall guidelines.',
              readAt: null,
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              link: '/notices/1'
            },
            {
              id: 'notif-2',
              type: 'DEADLINE',
              title: 'Deadline Approaching: DBMS Assignment 1',
              body: 'Assignment 1 submission is due on Oct 5 at 23:59 PM.',
              readAt: null,
              createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              link: '/deadlines'
            },
            {
              id: 'notif-3',
              type: 'EVENT',
              title: 'Registration Open: Tech Symposium 2026',
              body: 'Limited seats available in Main Auditorium. Reserve your spot now.',
              readAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
              createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
              link: '/events/1'
            }
          ]
        });
      }
      next(e);
    }
  }

  static async markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() }
      });
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(200).json({ success: true });
    }
  }

  static async markAllNotificationsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() }
      });
      res.status(200).json({ success: true });
    } catch (e: any) {
      res.status(200).json({ success: true });
    }
  }
}
