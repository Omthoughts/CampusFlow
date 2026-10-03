import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UploadService } from '../services/upload.service';
import { ExtractionService } from '../services/extraction.service';
import { SummaryService } from '../services/summary.service';
import { NoticeService } from '../services/notice.service';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { z } from 'zod';

export class AdminController {
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
      const activeNotices = await prisma.notice.count({ where: { status: 'PUBLISHED' } });
      const upcomingEvents = await prisma.event.count({ where: { date: { gte: new Date() } } });

      res.status(200).json({
        success: true,
        data: {
          studentCount,
          activeNotices,
          upcomingEvents
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadNotice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file provided', 400);
      }

      const { buffer, originalname, mimetype } = req.file;

      // 1. Upload and Deduplicate
      const uploadResult = await UploadService.uploadFile(buffer, originalname, mimetype);

      // 2. Extract Text
      const rawText = await ExtractionService.extractText(buffer, mimetype);

      // 3. AI Summary
      const summary = await SummaryService.generateSummary(rawText);

      // 4. Create Draft Notice
      const notice = await prisma.notice.create({
        data: {
          title: originalname, // Default title
          content: rawText,
          category: 'GENERAL', // Default category
          status: 'DRAFT',
          authorId: req.user.id,
          sourceUrl: uploadResult.secure_url,
          rawFileHash: uploadResult.hash,
        }
      });

      // 5. Store AI Summary if generated
      if (summary) {
        await prisma.noticeSummary.create({
          data: {
            noticeId: notice.id,
            whatChanged: summary.what_changed,
            whoAffected: summary.who_is_affected,
            requiredAction: summary.required_action,
            deadline: summary.deadline ? new Date(summary.deadline) : null,
            rawAIResponse: summary,
          }
        });
      }

      res.status(201).json({ success: true, noticeId: notice.id });
    } catch (error) {
      next(error);
    }
  }

  static async updateNotice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, content, category, priority, summary } = req.body;

      const notice = await prisma.notice.findUnique({ where: { id } });
      if (!notice) throw new AppError('Notice not found', 404);
      if (notice.status !== 'DRAFT') throw new AppError('Only draft notices can be updated', 400);

      await prisma.$transaction(async (tx) => {
        await tx.notice.update({
          where: { id },
          data: { title, content, category, priority }
        });

        if (summary) {
          await tx.noticeSummary.upsert({
            where: { noticeId: id },
            update: {
              whatChanged: summary.whatChanged,
              whoAffected: summary.whoAffected,
              requiredAction: summary.requiredAction,
              deadline: summary.deadline ? new Date(summary.deadline) : null,
            },
            create: {
              noticeId: id,
              whatChanged: summary.whatChanged,
              whoAffected: summary.whoAffected,
              requiredAction: summary.requiredAction,
              deadline: summary.deadline ? new Date(summary.deadline) : null,
            }
          });
        }
      });

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async publishNotice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { departmentId, year, division, batch } = req.body;

      await NoticeService.publishNotice({
        noticeId: id,
        adminId: req.user.id,
        departmentId,
        year,
        division,
        batch
      });

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, date, venue, capacity, registrationDeadline } = req.body;
      const event = await prisma.event.create({
        data: {
          title, description, date: new Date(date), venue, 
          capacity: capacity ? parseInt(capacity) : null,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
          createdById: req.user.id,
          status: 'DRAFT'
        }
      });
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  static async publishEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.$transaction(async (tx) => {
        await tx.event.update({ where: { id }, data: { status: 'PUBLISHED' } });
        await tx.auditLog.create({
          data: { actorId: req.user.id, action: 'PUBLISH_EVENT', entityType: 'Event', entityId: id }
        });
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { actor: { select: { name: true, email: true } } }
      });

      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}
