import { registerAs } from '@nestjs/config';
import type { AppConfig, LogLevel } from './types';

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: (process.env['NODE_ENV'] as AppConfig['nodeEnv']) ?? 'development',
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    jwtSecret: process.env['JWT_SECRET'] ?? '',
    jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '1h',
    maxUploadSizeBytes:
      parseInt(process.env['MAX_UPLOAD_SIZE_MB'] ?? '5', 10) * 1024 * 1024,
    throttleTtlMs: parseInt(process.env['THROTTLE_TTL_MS'] ?? '60000', 10),
    throttleLimit: parseInt(process.env['THROTTLE_LIMIT'] ?? '60', 10),
    logLevel: (process.env['LOG_LEVEL'] as LogLevel) ?? 'info',
  }),
);
