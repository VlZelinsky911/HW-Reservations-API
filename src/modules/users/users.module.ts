import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [ReservationsModule],
  controllers: [UsersController],
})
export class UsersModule {}
