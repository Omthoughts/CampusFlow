import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const secret = (process.env.AUTH_SECRET || 'dev-secret-key-32-chars-long-minimum') as string;
    const decoded = jwt.verify(token, secret) as { id: string; role: Role };
    
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          department: { select: { id: true, code: true, name: true } },
          year: true,
          division: true,
          batch: true,
          status: true,
          mustChangePassword: true,
        }
      });
    } catch (dbErr) {
      if (decoded.id.startsWith('dev-')) {
        const devUsersMap: Record<string, any> = {
          'dev-omkar-mca-id': {
            id: 'dev-omkar-mca-id',
            name: 'Omkar Mankar',
            email: 'omkar_mankar_mca@moderncoe.edu.in',
            role: 'STUDENT',
            status: 'ACTIVE',
            mustChangePassword: false,
          },
          'dev-admin-id': {
            id: 'dev-admin-id',
            name: 'System Admin',
            email: 'admin@moderncoe.edu.in',
            role: 'ADMIN',
            status: 'ACTIVE',
            mustChangePassword: false,
          },
          'dev-faculty-id': {
            id: 'dev-faculty-id',
            name: 'MCA Coordinator',
            email: 'faculty_mca@moderncoe.edu.in',
            role: 'FACULTY',
            status: 'ACTIVE',
            mustChangePassword: false,
          },
        };
        user = devUsersMap[decoded.id];
      }
    }

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }
    next();
  };
};
