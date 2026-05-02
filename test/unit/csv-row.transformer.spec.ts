import {
  transformAmenityRow,
  transformReservationRow,
} from '../../src/database/seed/csv-row.transformer';

describe('transformAmenityRow', () => {
  it('parses valid row', () => {
    const result = transformAmenityRow({ id: '3', name: ' Gym ' });
    expect(result).toEqual({ id: 3, name: 'Gym' });
  });

  it('throws on non-numeric id', () => {
    expect(() => transformAmenityRow({ id: 'abc', name: 'Gym' })).toThrow(
      'Invalid amenity id',
    );
  });

  it('throws on empty name', () => {
    expect(() => transformAmenityRow({ id: '1', name: '   ' })).toThrow(
      'Empty amenity name',
    );
  });
});

describe('transformReservationRow', () => {
  const valid = {
    id: '1',
    amenity_id: '2',
    user_id: '97',
    start_time: '600',
    end_time: '900',
    date: '1592611200000',
  };

  it('parses valid row', () => {
    const result = transformReservationRow(valid);
    expect(result.id).toBe(1);
    expect(result.amenityId).toBe(2);
    expect(result.userId).toBe(97);
    expect(result.startTime).toBe(600);
    expect(result.endTime).toBe(900);
    expect(result.date).toEqual(new Date(1592611200000));
  });

  it('throws when any field is non-numeric', () => {
    expect(() => transformReservationRow({ ...valid, user_id: 'x' })).toThrow();
  });

  it('converts date ms to Date at correct UTC time', () => {
    const result = transformReservationRow(valid);
    expect(result.date.toISOString()).toBe('2020-06-20T00:00:00.000Z');
  });
});
