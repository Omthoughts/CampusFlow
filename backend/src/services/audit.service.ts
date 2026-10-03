import { prisma } from '../config/prisma';

export class AuditService {
  static async log(actorId: string, action: string, entityType: string, entityId: string, metadata?: any) {
    return prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata || null,
      },
    });
  }
}
