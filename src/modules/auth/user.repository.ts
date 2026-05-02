import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { UserRecord } from './types';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async create(
    username: string,
    passwordHash: string,
  ): Promise<{ id: number }> {
    return this.prisma.user.create({
      data: { username, passwordHash },
      select: { id: true },
    });
  }
}
