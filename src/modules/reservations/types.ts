export interface AmenityReservationDto {
  reservationId: number;
  userId: number;
  startTime: string;
  duration: number;
  amenityName: string;
}

export interface UserReservationDto {
  reservationId: number;
  amenityId: number;
  amenityName: string;
  startTime: string;
  duration: number;
}

export interface UserReservationsByDayDto {
  date: number;
  reservations: UserReservationDto[];
}

export interface ReservationWithAmenity {
  id: number;
  amenityId: number;
  userId: number;
  startTime: number;
  endTime: number;
  date: Date;
  amenity: { name: string };
}
