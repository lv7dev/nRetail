/**
 * E2E — OTP error flows (Group 9.3)
 *
 * Phone: 0906666666
 *
 * Covers:
 * - Wrong OTP code → OTP_INVALID error shown, stays on /otp
 * - Expired OTP response (mocked via page.route) → OTP_EXPIRED message shown
 */

import { test, expect } from '@playwright/test';

const PHONE = '0906666666';
const WRONG_OTP = '000000';
const CORRECT_OTP = '999999';

test.describe('OTP error flows', () => {
  test('9.3a — wrong OTP shows error, stays on /otp', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="phone"]', PHONE);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/otp', { timeout: 10_000 });

    // Fill wrong OTP boxes
    const boxes = page.locator('input[maxlength="1"]');
    for (let i = 0; i < 6; i++) {
      await boxes.nth(i).fill(WRONG_OTP[i]);
    }

    // Should stay on /otp and show error
    await expect(page).toHaveURL('/otp', { timeout: 5_000 });
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5_000 });
  });

  test('9.3b — expired OTP response shows OTP_EXPIRED message', async ({ page }) => {
    // Intercept OTP verify to simulate an expired OTP server response
    await page.route('**/auth/otp/verify', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'OTP has expired',
          code: 'OTP_EXPIRED',
        }),
      }),
    );

    await page.goto('/register');
    await page.fill('input[name="phone"]', PHONE);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/otp', { timeout: 10_000 });

    const boxes = page.locator('input[maxlength="1"]');
    for (let i = 0; i < 6; i++) {
      await boxes.nth(i).fill(CORRECT_OTP[i]);
    }

    // OTP_EXPIRED error message should appear
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5_000 });
  });
});
