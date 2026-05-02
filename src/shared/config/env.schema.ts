import { z } from 'zod';
import type { Env } from './types';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('1h'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(5),
  THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(60),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${messages}`);
  }
  return result.data;
}
