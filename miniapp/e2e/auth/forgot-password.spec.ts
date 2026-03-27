/**
 * E2E — Forgot-password flow (Group 7.5)
 *
 * Phone: 0903333333
 * OTP:   999999 (backend fallback)
 *
 * Flow: /forgot-password → /otp → /new-password → /login
 * Then verify the user can log in with the new password.
 */

import { test, expect } from '@playwright/test';
import { seedUser, fillOtpBoxes } from '../fixtures/auth';

const FORGOT_PHONE = '0903333333';
const ORIGINAL_PASSWORD = 'original123';
const NEW_PASSWORD = 'newpassword456';
const NAME = 'Test Forgot';
const OTP = '999999';

test.describe('Forgot-password flow', () => {
  test.beforeAll(async ({ request }) => {
    await seedUser(request, FORGOT_PHONE, ORIGINAL_PASSWORD, NAME);
  });

  test('7.5 — full reset flow allows login with new password', async ({ page }) => {
    // Step 1: /forgot-password — enter phone
    await page.goto('/forgot-password');
    await page.fill('input[name="phone"]', FORGOT_PHONE);
    await page.click('button[type="submit"]');

    // Should navigate to /otp
    await expect(page).toHaveURL('/otp', { timeout: 10_000 });

    // Step 2: /otp — enter 6-digit code
    await fillOtpBoxes(page, OTP);

    // Should navigate to /new-password
    await expect(page).toHaveURL('/new-password', { timeout: 10_000 });

    // Step 3: /new-password — enter new password
    const passwordBoxes = page.locator('input[type="password"]');
    await passwordBoxes.first().fill(NEW_PASSWORD);
    await passwordBoxes.nth(1).fill(NEW_PASSWORD);
    await page.click('button[type="submit"]');

    // Should redirect to /login
    await expect(page).toHaveURL('/login', { timeout: 10_000 });

    // Step 4: Log in with the new password
    await page.fill('input[name="phone"]', FORGOT_PHONE);
    await page.fill('input[type="password"]', NEW_PASSWORD);
    await page.click('button[type="submit"]');

    // Should land on home
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });
});
