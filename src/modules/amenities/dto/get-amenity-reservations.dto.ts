import { z } from 'zod';

export const getAmenityReservationsSchema = z.object({
  date: z.coerce
    .number({ error: 'date must be a numeric timestamp' })
    .int()
    .positive({ message: 'date must be a positive timestamp' }),
});

export const amenityIdParamSchema = z.object({
  id: z.coerce
    .number({ error: 'id must be a number' })
    .int()
    .positive({ message: 'id must be a positive integer' }),
});

export type GetAmenityReservationsQuery = z.infer<
  typeof getAmenityReservationsSchema
>;
export type AmenityIdParam = z.infer<typeof amenityIdParamSchema>;
