export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  maxUploadSizeBytes: number;
  throttleTtlMs: number;
  throttleLimit: number;
  logLevel: LogLevel;
}

export type Env = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  MAX_UPLOAD_SIZE_MB: number;
  THROTTLE_TTL_MS: number;
  THROTTLE_LIMIT: number;
  LOG_LEVEL: LogLevel;
};
