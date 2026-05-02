import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReservationService } from '../reservations/reservation.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  amenityIdParamSchema,
  getAmenityReservationsSchema,
  type AmenityIdParam,
  type GetAmenityReservationsQuery,
} from './dto/get-amenity-reservations.dto';
import type { AmenityReservationDto } from '../reservations/types';

@Controller('amenities')
export class AmenityController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get(':id/reservations')
  async getReservations(
    @Param(new ZodValidationPipe(amenityIdParamSchema)) { id }: AmenityIdParam,
    @Query(new ZodValidationPipe(getAmenityReservationsSchema))
    { date }: GetAmenityReservationsQuery,
  ): Promise<AmenityReservationDto[]> {
    return this.reservationService.getByAmenityAndDate(id, date);
  }
}
