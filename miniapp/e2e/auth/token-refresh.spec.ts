/**
 * E2E — Token refresh flows (Group 8.1 & 8.2)
 *
 * Uses phone 0902222222 (same as login.spec.ts — already seeded by that suite).
 * If running in isolation, loginAs() will fail until the user exists; the
 * global-setup cleans up between runs so register → login is guaranteed.
 *
 * Flow 10 (8.1): expired access token + valid refresh token → silent refresh
 * Flow 11 (8.2): expired access token + invalid refresh token → forced logout
 */

import { test, expect } from '@playwright/test';
import { seedUser, loginAs, setExpiredAccessToken } from '../fixtures/auth';

const PHONE = '0902222222';
const PASSWORD = 'password123';
const NAME = 'Test Login';

test.describe('Token refresh flows', () => {
  // Ensure the user exists before running these tests.
  // seedUser() will throw if the phone is already registered — we ignore that.
  test.beforeAll(async ({ request }) => {
    try {
      await seedUser(request, PHONE, PASSWORD, NAME);
    } catch (err) {
      // User may already exist from login.spec.ts — if login then fails, check setup
      console.warn('[token-refresh setup] seedUser failed (may already exist):', err);
    }
  });

  test('8.1 — expired access token is silently refreshed (flow 10)', async ({ page }) => {
    // Log in to get real tokens
    await loginAs(page, PHONE, PASSWORD);

    // Capture the valid refresh token
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(refreshToken).toBeTruthy();

    // Replace the access token with an expired one (keep refresh token)
    await setExpiredAccessToken(page, refreshToken!);

    // Navigate to the protected route — the 401 interceptor should silently
    // refresh and re-issue a valid access token, keeping the user logged in.
    await page.goto('/');
    await expect(page).not.toHaveURL('/login', { timeout: 10_000 });
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('8.2 — invalid refresh token causes forced logout (flow 11)', async ({ page }) => {
    // Log in to get real tokens
    await loginAs(page, PHONE, PASSWORD);

    // Inject expired access token + a completely invalid refresh token
    await setExpiredAccessToken(page, 'invalid-refresh-token-that-does-not-exist');

    // Navigate to protected route — refresh will fail, user gets redirected
    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 15_000 });
  });
});
