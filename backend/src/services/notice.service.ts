import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';

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

      // Update notice state to PUBLISHED
      const updatedNotice = await tx.notice.update({
        where: { id: noticeId },
        data: {
          status: 'PUBLISHED',
          publishedAt: notice.publishedAt || new Date(),
        }
      });

      // Clear existing audiences for this notice and create new targeting rule
      await tx.noticeAudience.deleteMany({ where: { noticeId } });
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
