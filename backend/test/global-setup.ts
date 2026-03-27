import { execSync } from 'child_process';
import path from 'path';
import { Client } from 'pg';
import { TEST_DB_URL } from './constants';
const CONTAINER_NAME = 'nretail-test-db';
const CONTAINER_IMAGE = 'postgres:15-alpine';

async function waitForPostgres(url: string, maxMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const client = new Client({ connectionString: url });
      await client.connect();
      await client.end();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('Postgres did not become ready within 30s');
}

function isContainerRunning(): boolean {
  try {
    const output = execSync(
      `docker inspect --format='{{.State.Running}}' ${CONTAINER_NAME} 2>/dev/null`,
      { encoding: 'utf-8' },
    ).trim();
    return output === "'true'" || output === 'true';
  } catch {
    return false;
  }
}

async function createDatabase(): Promise<void> {
  // Connect to the default postgres DB to create our test DB
  const adminUrl = 'postgresql://postgres:postgres@localhost:5433/postgres';
  const client = new Client({ connectionString: adminUrl });
  await client.connect();
  try {
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = 'test_nretail'`,
    );
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE test_nretail');
      console.log('[global-setup] Created database test_nretail');
    } else {
      console.log('[global-setup] Database test_nretail already exists');
    }
  } finally {
    await client.end();
  }
}

export default async function globalSetup(): Promise<void> {
  console.log('[global-setup] Setting up integration test environment...');

  // Step 1: Start Docker container if not already running
  if (isContainerRunning()) {
    console.log(
      '[global-setup] Container nretail-test-db is already running — reusing it',
    );
  } else {
    console.log('[global-setup] Starting Docker Postgres container...');
    try {
      // Remove any stopped container with the same name
      execSync(`docker rm -f ${CONTAINER_NAME} 2>/dev/null || true`, {
        stdio: 'ignore',
      });
      execSync(
        `docker run -d --name ${CONTAINER_NAME} \
          -e POSTGRES_PASSWORD=postgres \
          -e POSTGRES_USER=postgres \
          -p 5433:5432 \
          ${CONTAINER_IMAGE}`,
        { stdio: 'inherit' },
      );
      console.log('[global-setup] Container started');
    } catch (err) {
      throw new Error(
        `Failed to start Docker Postgres container: ${String(err)}`,
      );
    }
  }

  // Step 2: Wait for Postgres to be ready (connect to postgres default DB)
  console.log('[global-setup] Waiting for Postgres to be ready...');
  await waitForPostgres(
    'postgresql://postgres:postgres@localhost:5433/postgres',
  );
  console.log('[global-setup] Postgres is ready');

  // Step 3: Create test_nretail database if it doesn't exist
  await createDatabase();

  // Step 4: Set env vars so AppModule and Prisma CLI can initialise correctly
  process.env.DATABASE_URL = TEST_DB_URL;
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.JWT_SECRET = 'integration-test-secret-minimum-32-chars';
  process.env.JWT_EXPIRES_IN = '15m';
  process.env.NODE_ENV = 'test';

  // Step 5: Run Prisma migrations
  console.log('[global-setup] Running prisma migrate deploy...');
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      DATABASE_URL: TEST_DB_URL,
    },
    stdio: 'inherit',
  });
  console.log('[global-setup] Migrations applied successfully');
  console.log('[global-setup] Setup complete');
}
