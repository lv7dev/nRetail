/**
 * E2E — RegisterComplete page (Group 9.1)
 *
 * Phone: 0904444444
 * OTP:   999999 (backend fallback)
 *
 * Covers:
 * - Valid submission via the full register flow → home
 * - Direct navigation to /register/complete without router state → /login redirect
 * - Password mismatch → inline validation error, no submission
 */

import { test, expect } from '@playwright/test';
import { fillOtpBoxes } from '../fixtures/auth';

const PHONE = '0904444444';
const PASSWORD = 'password123';
const NAME = 'Register Complete';
const OTP = '999999';

test.describe('RegisterComplete flow', () => {
  test('9.1a — valid registration flow ends on /', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="phone"]', PHONE);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/otp', { timeout: 10_000 });
    await fillOtpBoxes(page, OTP);

    await expect(page).toHaveURL('/register/complete', { timeout: 10_000 });

    await page.fill('input[name="name"]', NAME);
    const passwordBoxes = page.locator('input[type="password"]');
    await passwordBoxes.first().fill(PASSWORD);
    await passwordBoxes.nth(1).fill(PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('9.1b — direct navigation to /register/complete without state redirects to /login', async ({
    page,
  }) => {
    // Navigate directly — no router state → guard should redirect
    await page.goto('/register/complete');
    await expect(page).toHaveURL('/login', { timeout: 10_000 });
  });

  test('9.1c — password mismatch shows validation error, stays on page', async ({ page }) => {
    // Mock OTP endpoints so this test is isolated from DB state — the phone
    // may already be registered after 9.1a ran. We only need to reach
    // /register/complete to test client-side validation.
    await page.route('**/auth/otp/register', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      }),
    );
    await page.route('**/auth/otp/verify', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { otpToken: 'test-otp-token-for-validation' } }),
      }),
    );

    await page.goto('/register');
    await page.fill('input[name="phone"]', PHONE);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/otp', { timeout: 10_000 });
    await fillOtpBoxes(page, OTP);

    await expect(page).toHaveURL('/register/complete', { timeout: 10_000 });

    await page.fill('input[name="name"]', NAME);
    const passwordBoxes = page.locator('input[type="password"]');
    await passwordBoxes.first().fill(PASSWORD);
    await passwordBoxes.nth(1).fill('different-password');
    await page.click('button[type="submit"]');

    // Should stay on the same page and show validation error
    await expect(page).toHaveURL('/register/complete', { timeout: 5_000 });
    // Validation error message visible (translated from validation.passwordMismatch)
    await expect(page.locator('text=Passwords do not match')).toBeVisible({ timeout: 5_000 });
  });
});
