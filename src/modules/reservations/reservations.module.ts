import { Module } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { ReservationService } from './reservation.service';
import { AmenityRepository } from '../amenities/amenity.repository';
import { AmenityService } from '../amenities/amenity.service';

@Module({
  providers: [
    ReservationRepository,
    ReservationService,
    AmenityRepository,
    AmenityService,
  ],
  exports: [ReservationService],
})
export class ReservationsModule {}
