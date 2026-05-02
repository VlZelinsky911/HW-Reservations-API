import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from '../../../src/app.module';
import { HttpExceptionFilter } from '../../../src/shared/filters/http-exception.filter';
import { RequestIdInterceptor } from '../../../src/shared/interceptors/request-id.interceptor';

export async function createTestApp(): Promise<NestExpressApplication> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication<NestExpressApplication>();
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { limit: '1mb', extended: true });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());
  await app.init();
  return app;
}
