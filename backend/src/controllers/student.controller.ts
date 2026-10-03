import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middlewares/auth.middleware';

export class StudentController {
  
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      
      const notices = await prisma.notice.findMany({
        where: {
          status: 'PUBLISHED',
          priority: 'URGENT',
          audiences: {
            some: {
              OR: [
                { departmentId: null, year: null, division: null, batch: null }, // College-wide
                { 
                  departmentId: user.departmentId,
                  OR: [
                    { year: null },
                    { year: user.year }
                  ]
                }
              ]
            }
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: 3
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
    } catch (e) {
      next(e);
    }
  }

  static async getNotices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const notices = await prisma.notice.findMany({
        where: { 
          status: 'PUBLISHED',
          audiences: {
            some: {
              OR: [
                { departmentId: null, year: null, division: null, batch: null }, // College-wide
                { 
                  departmentId: user.departmentId,
                  OR: [
                    { year: null },
                    { year: user.year }
                  ]
                }
              ]
            }
          }
        },
        orderBy: { publishedAt: 'desc' }
      });
      res.status(200).json({ data: notices, total: notices.length });
    } catch (e) {
      next(e);
    }
  }

  static async getNoticeById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notice = await prisma.notice.findUnique({
        where: { id },
        include: { summary: true, attachments: true, author: { select: { name: true } } }
      });
      if (!notice) throw new AppError('Notice not found', 404);
      res.status(200).json(notice);
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
    } catch (e) {
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
    } catch (e) {
      next(e);
    }
  }

  static async getEventById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          _count: { select: { registrations: true } },
          registrations: { where: { userId: req.user!.id } }
        }
      });
      if (!event) throw new AppError('Event not found', 404);
      
      res.status(200).json({
        ...event,
        registeredCount: event._count.registrations,
        isRegistered: event.registrations.length > 0
      });
    } catch (e) {
      next(e);
    }
  }

  static async registerForEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
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
    } catch (e) {
      next(e);
    }
  }

  static async cancelRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await prisma.registration.delete({
        where: { eventId_userId: { eventId: id, userId } }
      });

      res.status(200).json({ success: true });
    } catch (e) {
      next(e);
    }
  }
}
