import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.coerce
    .number({ error: 'id must be a number' })
    .int()
    .positive({ message: 'id must be a positive integer' }),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
