import type { APIRequestContext, Page } from '@playwright/test';

/**
 * Fill the OTP input boxes (individual single-character inputs) with the
 * provided OTP string, one character per box.
 */
export async function fillOtpBoxes(page: Page, otp: string): Promise<void> {
  const boxes = page.locator('input[maxlength="1"]');
  for (let i = 0; i < otp.length; i++) {
    await boxes.nth(i).fill(otp[i]);
  }
}

export const API_BASE = 'http://localhost:3001';

/**
 * Complete the full registration flow via the backend API.
 *
 * The backend uses OTP '999999' as a fallback for any phone that has no
 * PhoneConfig row — no DB seeding required.
 *
 * After calling this, the phone/password combination can be used with loginAs().
 */
export async function seedUser(
  request: APIRequestContext,
  phone: string,
  password: string,
  name: string,
): Promise<void> {
  // Step 1: Request OTP (register flow)
  const otpRes = await request.post(`${API_BASE}/auth/otp/register`, {
    data: { phone },
  });
  if (!otpRes.ok()) {
    const body = await otpRes.json().catch(() => ({}));
    throw new Error(
      `seedUser: OTP request failed for ${phone} — ${otpRes.status()} ${JSON.stringify(body)}`,
    );
  }

  // Step 2: Verify OTP with the universal bypass code
  const verifyRes = await request.post(`${API_BASE}/auth/otp/verify`, {
    data: { phone, otp: '999999' },
  });
  if (!verifyRes.ok()) {
    const body = await verifyRes.json().catch(() => ({}));
    throw new Error(
      `seedUser: OTP verify failed for ${phone} — ${verifyRes.status()} ${JSON.stringify(body)}`,
    );
  }
  const verifyBody = await verifyRes.json();
  const otpToken: string = verifyBody.data?.otpToken ?? verifyBody.otpToken;

  // Step 3: Complete registration
  const registerRes = await request.post(`${API_BASE}/auth/register`, {
    data: { otpToken, name, password, confirmPassword: password },
  });
  if (!registerRes.ok()) {
    const body = await registerRes.json().catch(() => ({}));
    throw new Error(
      `seedUser: registration failed for ${phone} — ${registerRes.status()} ${JSON.stringify(body)}`,
    );
  }
}

/**
 * Navigate to /login, fill credentials, and wait for redirect to /.
 * Assumes the user has already been seeded via seedUser().
 */
export async function loginAs(page: Page, phone: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="phone"]', phone);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10_000 });
}

/**
 * Replace the stored access token with a syntactically valid but expired JWT,
 * while keeping the provided refresh token intact.
 *
 * Call this after loginAs() to simulate a session where the access token has
 * expired but the refresh token is still valid (flow 10).
 */
export async function setExpiredAccessToken(page: Page, validRefreshToken: string): Promise<void> {
  // A syntactically valid HS256 JWT with exp in the past (2018-01-18)
  const expiredJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9' +
    '.4Adcj3UFYzPUVaVF43FmMze6QEJF_zRl-2fI_jNVgA0';

  await page.evaluate(
    ([expired, refresh]: [string, string]) => {
      localStorage.setItem('accessToken', expired);
      localStorage.setItem('refreshToken', refresh);
    },
    [expiredJwt, validRefreshToken] as [string, string],
  );
}
