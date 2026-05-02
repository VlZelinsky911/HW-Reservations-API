import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AmenityDto } from './types';

@Injectable()
export class AmenityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<AmenityDto | null> {
    return this.prisma.amenity.findUnique({ where: { id } });
  }
}
