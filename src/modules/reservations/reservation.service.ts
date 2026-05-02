import { Injectable } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { AmenityService } from '../amenities/amenity.service';
import {
  minutesToHHMM,
  normalizeToStartOfDayUtc,
} from '../../shared/utils/date.utils';
import type {
  AmenityReservationDto,
  UserReservationsByDayDto,
  UserReservationDto,
  ReservationWithAmenity,
} from './types';

@Injectable()
export class ReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly amenityService: AmenityService,
  ) {}

  async getByAmenityAndDate(
    amenityId: number,
    dateMs: number,
  ): Promise<AmenityReservationDto[]> {
    await this.amenityService.findByIdOrThrow(amenityId);

    const dateUtc = normalizeToStartOfDayUtc(dateMs);
    const rows = await this.reservationRepository.findByAmenityAndDate(
      amenityId,
      dateUtc,
    );

    return rows.map((r) => this.toAmenityReservationDto(r));
  }

  async getByUser(userId: number): Promise<UserReservationsByDayDto[]> {
    const rows = await this.reservationRepository.findByUserId(userId);
    return this.groupByDay(rows);
  }

  private toAmenityReservationDto(
    r: ReservationWithAmenity,
  ): AmenityReservationDto {
    return {
      reservationId: r.id,
      userId: r.userId,
      startTime: minutesToHHMM(r.startTime),
      duration: r.endTime - r.startTime,
      amenityName: r.amenity.name,
    };
  }

  private toUserReservationDto(r: ReservationWithAmenity): UserReservationDto {
    return {
      reservationId: r.id,
      amenityId: r.amenityId,
      amenityName: r.amenity.name,
      startTime: minutesToHHMM(r.startTime),
      duration: r.endTime - r.startTime,
    };
  }

  private groupByDay(
    rows: ReservationWithAmenity[],
  ): UserReservationsByDayDto[] {
    const map = new Map<number, UserReservationDto[]>();

    for (const r of rows) {
      const dayMs = normalizeToStartOfDayUtc(r.date.getTime()).getTime();
      const existing = map.get(dayMs) ?? [];
      existing.push(this.toUserReservationDto(r));
      map.set(dayMs, existing);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([date, reservations]) => ({ date, reservations }));
  }
}
