/**
 * E2E — Logout flow (Group 9.2)
 *
 * Phone: 0905555555
 * OTP:   999999 (backend fallback)
 *
 * Covers:
 * - Logout button clears session and redirects to /login
 * - Post-logout visit to a protected route (/) redirects to /login
 */

import { test, expect } from '@playwright/test';
import { seedUser, loginAs } from '../fixtures/auth';

const PHONE = '0905555555';
const PASSWORD = 'password123';
const NAME = 'Logout Test';

test.describe('Logout flow', () => {
  test.beforeAll(async ({ request }) => {
    await seedUser(request, PHONE, PASSWORD, NAME);
  });

  test('9.2a — logout redirects to /login', async ({ page }) => {
    await loginAs(page, PHONE, PASSWORD);
    await expect(page).toHaveURL('/', { timeout: 10_000 });

    // Navigate to the profile page where the logout button lives
    await page.goto('/profile');
    await page.click('button[data-testid="logout-btn"]');

    await expect(page).toHaveURL('/login', { timeout: 10_000 });
  });

  test('9.2b — post-logout visit to / redirects to /login', async ({ page }) => {
    await loginAs(page, PHONE, PASSWORD);

    // Clear tokens to simulate post-logout state
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });

    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 10_000 });
  });
});
