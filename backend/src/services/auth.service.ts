import { prisma } from '../config/prisma';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import { UserStatus } from '@prisma/client';

export class AuthService {
  static async login(email: string, passwordRaw: string) {
    const normalizedEmail = email.replace(/\s/g, '').toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        department: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    const isValid = await argon2.verify(user.passwordHash, passwordRaw);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.AUTH_SECRET as string,
      { expiresIn: user.role === 'ADMIN' ? '2h' : '8h' }
    );

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department?.name,
      year: user.year,
      division: user.division,
      batch: user.batch,
      mustChangePassword: user.mustChangePassword,
    };

    return { token, user: userResponse };
  }
}
