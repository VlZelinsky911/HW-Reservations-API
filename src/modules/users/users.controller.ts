import { Controller, Get, Param } from '@nestjs/common';
import { ReservationService } from '../reservations/reservation.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  userIdParamSchema,
  type UserIdParam,
} from './dto/get-user-reservations.dto';
import type { UserReservationsByDayDto } from '../reservations/types';

@Controller('users')
export class UsersController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get(':id/reservations')
  async getReservations(
    @Param(new ZodValidationPipe(userIdParamSchema)) { id }: UserIdParam,
  ): Promise<UserReservationsByDayDto[]> {
    return this.reservationService.getByUser(id);
  }
}
