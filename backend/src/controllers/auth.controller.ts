import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';
import { AppError } from '../utils/errors';

const loginSchema = z.object({
  email: z.string().email().endsWith('@moderncoe.edu.in'),
  password: z.string().min(8),
});

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.safeParse(req.body);
      if (!validated.success) {
        throw new AppError('Invalid email or password', 400, 'VALIDATION_ERROR');
      }

      const { email, password } = validated.data;
      const { token, user } = await AuthService.login(email, password);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: user.role === 'ADMIN' ? 2 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - set by auth middleware
      const user = req.user;
      return res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }
}
