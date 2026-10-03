import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import { AuditService } from './audit.service';

interface PublishNoticeParams {
  noticeId: string;
  adminId: string;
  departmentId?: string;
  year?: 'FY' | 'SY';
  division?: 'A' | 'B';
  batch?: 'F1' | 'F2' | 'F3';
}

export class NoticeService {
  static async publishNotice(params: PublishNoticeParams) {
    const { noticeId, adminId, departmentId, year, division, batch } = params;

    return prisma.$transaction(async (tx) => {
      const notice = await tx.notice.findUnique({ where: { id: noticeId } });
      if (!notice) {
        throw new AppError('Notice not found', 404);
      }
      
      if (notice.status === 'PUBLISHED') {
        throw new AppError('Notice is already published', 400);
      }

      // Update notice state
      const updatedNotice = await tx.notice.update({
        where: { id: noticeId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        }
      });

      // Create Audience Targeting
      await tx.noticeAudience.create({
        data: {
          noticeId,
          departmentId: departmentId || null,
          year: year || null,
          division: division || null,
          batch: batch || null,
        }
      });

      // Write audit log
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: 'PUBLISH_NOTICE',
          entityType: 'Notice',
          entityId: noticeId,
          metadata: {
            audience: { departmentId, year, division, batch }
          }
        }
      });

      return updatedNotice;
    });
  }
}
