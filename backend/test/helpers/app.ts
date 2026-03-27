import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/shared/filters/http-exception.filter';
import { LoggingInterceptor } from '../../src/shared/interceptors/logging.interceptor';
import { ResponseInterceptor } from '../../src/shared/interceptors/response.interceptor';
import { globalValidationPipe } from '../../src/shared/pipes/validation.pipe';

/**
 * Creates and initialises a NestJS test application connected to the test DB.
 *
 * Uses the same AppModule, pipes, interceptors, and filters as main.ts so that
 * HTTP response shapes match production exactly. No repositories are mocked.
 *
 * DATABASE_URL must be set before calling this (done by global-setup.ts).
 *
 * **IMPORTANT**: Callers must call `await closeTestApp(app)` in `afterAll()`
 * to release the Prisma connection pool, or the Jest process may hang.
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

/** Call in afterAll() to close the app and release DB connections. */
export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}
