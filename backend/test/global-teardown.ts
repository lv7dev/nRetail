import { Client } from 'pg';
import { TEST_DB_URL } from './constants';

export default async function globalTeardown(): Promise<void> {
  console.log('[global-teardown] Truncating all test tables...');

  const client = new Client({ connectionString: TEST_DB_URL });
  await client.connect();
  try {
    // Dynamically discover all public tables (excluding Prisma's own migrations table)
    // so teardown self-maintains as the schema grows. CASCADE handles FK ordering.
    // We keep the schema intact and the container running so the next run is fast.
    const { rows } = await client.query<{ tables: string | null }>(`
      SELECT string_agg('"' || tablename || '"', ', ') AS tables
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
    `);
    if (rows[0].tables) {
      await client.query(
        `TRUNCATE TABLE ${rows[0].tables} RESTART IDENTITY CASCADE`,
      );
      console.log('[global-teardown] All tables truncated');
    } else {
      console.log('[global-teardown] No tables found — nothing to truncate');
    }
  } finally {
    await client.end();
  }

  console.log('[global-teardown] Teardown complete');
}
