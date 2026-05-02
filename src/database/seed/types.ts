export interface RawAmenityRow {
  id: string;
  name: string;
}

export interface RawReservationRow {
  id: string;
  amenity_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  date: string;
}

export interface AmenityCreateData {
  id: number;
  name: string;
}

export interface ReservationCreateData {
  id: number;
  amenityId: number;
  userId: number;
  startTime: number;
  endTime: number;
  date: Date;
}
