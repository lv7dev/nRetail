/**
 * E2E — Registration flow (Group 7.1 & 7.2)
 *
 * Phone: 0901111111
 * OTP:   999999 (backend fallback — any phone without PhoneConfig uses this)
 *
 * Test order matters: 7.1 registers the phone, 7.2 tries again and gets the
 * duplicate-phone error. The global setup cleans up between full runs.
 */

import { test, expect } from '@playwright/test'
import { fillOtpBoxes, API_BASE } from '../fixtures/auth'

const REGISTER_PHONE = '0901111111'
const PASSWORD = 'password123'
const NAME = 'Test Register'
const OTP = '999999'

test.describe('Registration flow', () => {
  test('7.1 — full registration flow lands on /', async ({ page }) => {
    // Step 1: /register — enter phone
    await page.goto('/register')
    await page.fill('input[name="phone"]', REGISTER_PHONE)
    await page.click('button[type="submit"]')

    // Should navigate to /otp
    await expect(page).toHaveURL('/otp', { timeout: 10_000 })

    // Step 2: /otp — enter 6-digit code
    await fillOtpBoxes(page, OTP)

    // Should navigate to /register/complete
    await expect(page).toHaveURL('/register/complete', { timeout: 10_000 })

    // Step 3: /register/complete — enter name + passwords
    await page.fill('input[name="name"]', NAME)
    const passwordBoxes = page.locator('input[type="password"]')
    await passwordBoxes.first().fill(PASSWORD)
    await passwordBoxes.nth(1).fill(PASSWORD)
    await page.click('button[type="submit"]')

    // Should land on the home page
    await expect(page).toHaveURL('/', { timeout: 10_000 })
  })

  test('7.2 — duplicate phone shows error', async ({ page, request }) => {
    // Ensure the phone is already registered (may have been done in 7.1,
    // but we register via API here to be self-contained as well).
    const otpRes = await request.post(`${API_BASE}/auth/otp/register`, {
      data: { phone: REGISTER_PHONE },
    })
    if (otpRes.ok()) {
      // Phone was not yet registered — complete registration via API
      const verifyRes = await request.post(`${API_BASE}/auth/otp/verify`, {
        data: { phone: REGISTER_PHONE, otp: OTP },
      })
      const verifyBody = await verifyRes.json()
      const otpToken: string = verifyBody.data?.otpToken ?? verifyBody.otpToken
      await request.post(`${API_BASE}/auth/register`, {
        data: {
          otpToken,
          name: NAME,
          password: PASSWORD,
          confirmPassword: PASSWORD,
        },
      })
    } else if (otpRes.status() !== 409) {
      throw new Error(`Unexpected OTP response ${otpRes.status()}: expected 200 or 409`)
    }
    // 409 = phone already exists = what we wanted

    // Now try to register the same phone via the UI
    await page.goto('/register')
    await page.fill('input[name="phone"]', REGISTER_PHONE)
    await page.click('button[type="submit"]')

    // Should stay on /register and display an error alert
    await expect(page).toHaveURL('/register', { timeout: 10_000 })
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5_000 })
  })
})
