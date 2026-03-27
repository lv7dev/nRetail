/**
 * E2E — Route guard (Group 7.6)
 *
 * Verifies that an unauthenticated visit to / redirects to /login.
 */

import { test, expect } from '@playwright/test'

test.describe('Route guard', () => {
  test('7.6 — unauthenticated visit to / redirects to /login', async ({ page }) => {
    // Ensure no tokens are stored
    await page.goto('/login') // visit any page first so we can access localStorage
    await page.evaluate(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    })

    // Now navigate to the protected home route
    await page.goto('/')

    // Should redirect to /login
    await expect(page).toHaveURL('/login', { timeout: 10_000 })
  })
})
