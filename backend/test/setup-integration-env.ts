// Sets required env vars in each Jest worker process before the NestJS app bootstraps.
// global-setup.ts runs in a separate process and its process.env changes do not propagate
// to test workers — this file fills that gap.
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5433/test_nretail';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.JWT_SECRET ??= 'integration-test-secret-minimum-32-chars';
process.env.JWT_EXPIRES_IN ??= '15m';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGINS ??= 'http://localhost:3000';
