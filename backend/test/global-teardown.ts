import { Client } from 'pg';

const TEST_DB_URL =
  'postgresql://postgres:postgres@localhost:5433/test_nretail';

export default async function globalTeardown(): Promise<void> {
  console.log('[global-teardown] Truncating all test tables...');

  const client = new Client({ connectionString: TEST_DB_URL });
  await client.connect();
  try {
    // Truncate in dependency-safe order (CASCADE handles FK constraints).
    // We keep the schema intact and the container running so the next run is fast.
    await client.query(
      `TRUNCATE "OtpVerification", "RefreshToken", "PhoneConfig", "User" CASCADE`,
    );
    console.log('[global-teardown] All tables truncated');
  } finally {
    await client.end();
  }

  console.log('[global-teardown] Teardown complete');
}
