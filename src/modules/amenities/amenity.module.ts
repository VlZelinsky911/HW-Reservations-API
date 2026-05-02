import { Module } from '@nestjs/common';
import { AmenityController } from './amenity.controller';
import { AmenityRepository } from './amenity.repository';
import { AmenityService } from './amenity.service';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [ReservationsModule],
  controllers: [AmenityController],
  providers: [AmenityRepository, AmenityService],
  exports: [AmenityService],
})
export class AmenityModule {}
