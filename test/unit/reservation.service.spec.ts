import { ReservationService } from '../../src/modules/reservations/reservation.service';
import type { ReservationRepository } from '../../src/modules/reservations/reservation.repository';
import type { AmenityService } from '../../src/modules/amenities/amenity.service';
import type { ReservationWithAmenity } from '../../src/modules/reservations/types';

const makeRow = (
  overrides: Partial<ReservationWithAmenity> = {},
): ReservationWithAmenity => ({
  id: 1,
  amenityId: 1,
  userId: 10,
  startTime: 600,
  endTime: 900,
  date: new Date('2020-06-20T00:00:00.000Z'),
  amenity: { name: 'Gym' },
  ...overrides,
});

describe('ReservationService.getByAmenityAndDate', () => {
  const mockRepo = {
    findByAmenityAndDate: jest.fn(),
    findByUserId: jest.fn(),
  } as unknown as ReservationRepository;

  const mockAmenityService = {
    findByIdOrThrow: jest.fn(),
  } as unknown as AmenityService;

  const service = new ReservationService(mockRepo, mockAmenityService);

  beforeEach(() => jest.clearAllMocks());

  it('returns mapped DTO list sorted by startTime', async () => {
    (mockRepo.findByAmenityAndDate as jest.Mock).mockResolvedValue([
      makeRow({ id: 1, startTime: 300, endTime: 600 }),
      makeRow({ id: 2, startTime: 600, endTime: 900 }),
    ]);
    (mockAmenityService.findByIdOrThrow as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Gym',
    });

    const result = await service.getByAmenityAndDate(1, Date.UTC(2020, 5, 20));

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      reservationId: 1,
      userId: 10,
      startTime: '05:00',
      duration: 300,
      amenityName: 'Gym',
    });
    expect(result[1]?.startTime).toBe('10:00');
  });

  it('throws when amenity not found', async () => {
    (mockAmenityService.findByIdOrThrow as jest.Mock).mockRejectedValue(
      new Error('Amenity not found'),
    );
    await expect(
      service.getByAmenityAndDate(99, Date.UTC(2020, 5, 20)),
    ).rejects.toThrow('Amenity not found');
  });

  it('returns empty array when no reservations', async () => {
    (mockRepo.findByAmenityAndDate as jest.Mock).mockResolvedValue([]);
    (mockAmenityService.findByIdOrThrow as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Gym',
    });
    const result = await service.getByAmenityAndDate(1, Date.UTC(2020, 5, 20));
    expect(result).toEqual([]);
  });
});

describe('ReservationService.getByUser', () => {
  const mockRepo = {
    findByAmenityAndDate: jest.fn(),
    findByUserId: jest.fn(),
  } as unknown as ReservationRepository;

  const mockAmenityService = {
    findByIdOrThrow: jest.fn(),
  } as unknown as AmenityService;

  const service = new ReservationService(mockRepo, mockAmenityService);

  beforeEach(() => jest.clearAllMocks());

  it('groups reservations by day ascending', async () => {
    (mockRepo.findByUserId as jest.Mock).mockResolvedValue([
      makeRow({
        id: 1,
        date: new Date('2020-06-21T00:00:00.000Z'),
        startTime: 300,
      }),
      makeRow({
        id: 2,
        date: new Date('2020-06-20T00:00:00.000Z'),
        startTime: 600,
      }),
    ]);

    const result = await service.getByUser(10);

    expect(result).toHaveLength(2);
    expect(result[0]?.date).toBe(Date.UTC(2020, 5, 20));
    expect(result[1]?.date).toBe(Date.UTC(2020, 5, 21));
    expect(result[0]?.reservations[0]?.reservationId).toBe(2);
  });

  it('returns empty array for user with no reservations', async () => {
    (mockRepo.findByUserId as jest.Mock).mockResolvedValue([]);
    const result = await service.getByUser(999);
    expect(result).toEqual([]);
  });

  it('groups multiple reservations on same day', async () => {
    const day = new Date('2020-06-20T00:00:00.000Z');
    (mockRepo.findByUserId as jest.Mock).mockResolvedValue([
      makeRow({ id: 1, date: day, startTime: 300 }),
      makeRow({ id: 2, date: day, startTime: 600 }),
    ]);

    const result = await service.getByUser(10);

    expect(result).toHaveLength(1);
    expect(result[0]?.reservations).toHaveLength(2);
  });
});
