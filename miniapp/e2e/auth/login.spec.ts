/**
 * E2E — Login flow (Group 7.3 & 7.4)
 *
 * Phone: 0902222222
 * OTP:   999999 (backend fallback)
 */

import { test, expect } from '@playwright/test'
import { seedUser } from '../fixtures/auth'

const LOGIN_PHONE = '0902222222'
const PASSWORD = 'password123'
const NAME = 'Test Login'

test.describe('Login flow', () => {
  // Seed the user once before all tests in this describe block
  test.beforeAll(async ({ request }) => {
    await seedUser(request, LOGIN_PHONE, PASSWORD, NAME)
  })

  test('7.3 — valid credentials land on /', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="phone"]', LOGIN_PHONE)
    await page.fill('input[type="password"]', PASSWORD)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/', { timeout: 10_000 })
  })

  test('7.4 — invalid credentials stay on /login with error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="phone"]', LOGIN_PHONE)
    await page.fill('input[type="password"]', 'wrong-password')
    await page.click('button[type="submit"]')

    // Should stay on /login
    await expect(page).toHaveURL('/login', { timeout: 10_000 })
    // Error alert should appear (INVALID_CREDENTIALS)
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5_000 })
  })
})
