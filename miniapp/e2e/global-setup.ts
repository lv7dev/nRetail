/**
 * Playwright global setup — runs once before all E2E tests.
 *
 * The backend's OTP fallback is already '999999' for phones that have NO
 * PhoneConfig row. We only need to ensure test phones are clean (no leftover
 * users from previous runs) so that registration tests can re-register.
 *
 * Strategy: clean up any User and OtpVerification rows for known test phones
 * so each run starts from a fresh state.
 */

import { Client } from 'pg';

const TEST_DB_URL = 'postgresql://postgres:postgres@localhost:5433/test_nretail';

const TEST_PHONES = [
  '0901111111', // register tests
  '0902222222', // login tests
  '0903333333', // forgot-password tests
  '0904444444', // register-complete tests (9.1)
  '0905555555', // logout tests (9.2)
  '0906666666', // otp-errors tests (9.3)
];

export default async function globalSetup() {
  const client = new Client({ connectionString: TEST_DB_URL });
  try {
    await client.connect();

    // Clean up any leftover users and tokens from previous runs
    for (const phone of TEST_PHONES) {
      // Delete refresh tokens (FK to User), then the user
      await client.query(
        `DELETE FROM "RefreshToken" WHERE "userId" IN (SELECT id FROM "User" WHERE phone = $1)`,
        [phone],
      );
      await client.query(`DELETE FROM "User" WHERE phone = $1`, [phone]);
      // Clean up any pending OTPs
      await client.query(`DELETE FROM "OtpVerification" WHERE phone = $1`, [phone]);
    }

    await client.end();
  } catch (err) {
    // If DB is not available, log a warning and continue.
    // Tests that need the real backend will fail for a clearer reason.
    console.warn(
      '[global-setup] Could not connect to test DB — skipping cleanup.',
      err instanceof Error ? err.message : err,
    );
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
}
