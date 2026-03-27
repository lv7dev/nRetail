/**
 * Smoke integration test — verifies the Docker Postgres setup is working
 * and the test DB is accessible. No real business logic tested here.
 */
import { Client } from 'pg';

const TEST_DB_URL =
  'postgresql://postgres:postgres@localhost:5433/test_nretail';

describe('Integration test infrastructure (smoke)', () => {
  it('can connect to the test database', async () => {
    const client = new Client({ connectionString: TEST_DB_URL });
    await client.connect();
    const res = await client.query('SELECT current_database()');
    await client.end();
    expect(res.rows[0].current_database).toBe('test_nretail');
  });

  it('has the User table (migrations applied)', async () => {
    const client = new Client({ connectionString: TEST_DB_URL });
    await client.connect();
    const res = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'User'`,
    );
    await client.end();
    expect(res.rowCount).toBeGreaterThan(0);
  });
});
