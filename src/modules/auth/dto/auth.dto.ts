import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'username must be at least 3 characters' })
    .max(32, { message: 'username must be at most 32 characters' }),
  password: z
    .string()
    .min(8, { message: 'password must be at least 8 characters' }),
});

export const loginSchema = registerSchema;

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
