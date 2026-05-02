import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { appConfig } from './shared/config/app.config';
import { validateEnv } from './shared/config/env.schema';
import { DatabaseModule } from './database/database.module';
import { CsvSeederService } from './database/seed/csv-seeder.service';
import { AmenityModule } from './modules/amenities/amenity.module';
import { UsersModule } from './modules/users/users.module';
import { CsvModule } from './modules/csv/csv.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [appConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['LOG_LEVEL'] ?? 'info',
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        customProps: (req) => ({
          requestId: (req as { headers: Record<string, string> }).headers[
            'x-request-id'
          ],
        }),
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: Number(process.env['THROTTLE_TTL_MS'] ?? 60000),
            limit: Number(process.env['THROTTLE_LIMIT'] ?? 60),
          },
        ],
      }),
    }),
    DatabaseModule,
    AmenityModule,
    UsersModule,
    CsvModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [
    CsvSeederService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
