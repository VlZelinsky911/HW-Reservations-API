import type {
  RawAmenityRow,
  RawReservationRow,
  AmenityCreateData,
  ReservationCreateData,
} from './types';

export function transformAmenityRow(row: RawAmenityRow): AmenityCreateData {
  const id = parseInt(row.id, 10);
  if (isNaN(id)) throw new Error(`Invalid amenity id: "${row.id}"`);
  if (!row.name?.trim()) throw new Error(`Empty amenity name for id ${id}`);
  return { id, name: row.name.trim() };
}

export function transformReservationRow(
  row: RawReservationRow,
): ReservationCreateData {
  const id = parseInt(row.id, 10);
  const amenityId = parseInt(row.amenity_id, 10);
  const userId = parseInt(row.user_id, 10);
  const startTime = parseInt(row.start_time, 10);
  const endTime = parseInt(row.end_time, 10);
  const dateMs = parseInt(row.date, 10);

  if ([id, amenityId, userId, startTime, endTime, dateMs].some(isNaN)) {
    throw new Error(
      `Invalid numeric fields in reservation row: ${JSON.stringify(row)}`,
    );
  }

  return { id, amenityId, userId, startTime, endTime, date: new Date(dateMs) };
}
