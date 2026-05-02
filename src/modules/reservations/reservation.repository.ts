import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { ReservationWithAmenity } from './types';

@Injectable()
export class ReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAmenityAndDate(
    amenityId: number,
    dateStartUtc: Date,
  ): Promise<ReservationWithAmenity[]> {
    const nextDay = new Date(dateStartUtc);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    return this.prisma.reservation.findMany({
      where: {
        amenityId,
        date: { gte: dateStartUtc, lt: nextDay },
      },
      include: { amenity: { select: { name: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async findByUserId(userId: number): Promise<ReservationWithAmenity[]> {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { amenity: { select: { name: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
}
