import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/shared/filters/http-exception.filter';
import { LoggingInterceptor } from '../../src/shared/interceptors/logging.interceptor';
import { ResponseInterceptor } from '../../src/shared/interceptors/response.interceptor';
import { globalValidationPipe } from '../../src/shared/pipes/validation.pipe';

/**
 * Bootstrap a full NestJS test application connected to the real test database.
 *
 * Uses the same AppModule, pipes, interceptors, and filters as main.ts so that
 * HTTP response shapes match production exactly. No repositories are mocked.
 *
 * The DATABASE_URL environment variable must already point to the test DB before
 * this function is called (set by global-setup.ts).
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  // Mirror the global pipeline from main.ts
  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalInterceptors(new ResponseInterceptor(), new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  return app;
}
