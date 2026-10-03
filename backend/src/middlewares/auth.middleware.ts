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

    const decoded = jwt.verify(token, process.env.AUTH_SECRET as string) as { id: string; role: Role };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        year: true,
        division: true,
        batch: true,
        status: true,
        mustChangePassword: true,
      }
    });

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
