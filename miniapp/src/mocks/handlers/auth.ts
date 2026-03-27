import { http, HttpResponse } from "msw";

// NOTE: MSW v2 Node server requires absolute URLs or wildcard-origin patterns
// ("*/path") to match intercepted requests. Relative paths ("/path") are only
// supported in the browser service-worker mode.
export const authHandlers = [
  http.post("*/auth/login", () => {
    return HttpResponse.json({
      data: {
        accessToken: "default-access-token",
        refreshToken: "default-refresh-token",
        user: {
          id: "user-1",
          phone: "0901234567",
          name: "Test User",
          role: "CUSTOMER",
        },
      },
    });
  }),

  http.post("*/auth/otp/register", () => {
    return HttpResponse.json({ data: null });
  }),

  http.post("*/auth/otp/forgot-password", () => {
    return HttpResponse.json({ data: null });
  }),

  http.post("*/auth/otp/verify", () => {
    return HttpResponse.json({ data: { otpToken: "default-otp-token" } });
  }),

  http.post("*/auth/register", () => {
    return HttpResponse.json({
      data: {
        accessToken: "default-access-token",
        refreshToken: "default-refresh-token",
        user: {
          id: "user-1",
          phone: "0901234567",
          name: "Test User",
          role: "CUSTOMER",
        },
      },
    });
  }),

  http.post("*/auth/reset-password", () => {
    return HttpResponse.json({
      data: {
        accessToken: "default-access-token",
        refreshToken: "default-refresh-token",
        user: {
          id: "user-1",
          phone: "0901234567",
          name: "Test User",
          role: "CUSTOMER",
        },
      },
    });
  }),

  // Note: /auth/refresh is called by refreshClient (bare axios, no interceptors).
  // The backend ResponseInterceptor wraps all responses as { data: T }, so the
  // refreshClient reads data.data.accessToken (double-wrapped). This handler must
  // return the same envelope shape.
  http.post("*/auth/refresh", () => {
    return HttpResponse.json({
      data: {
        accessToken: "default-new-access-token",
        refreshToken: "default-new-refresh-token",
      },
    });
  }),

  http.post("*/auth/logout", () => {
    return HttpResponse.json({ data: null });
  }),

  http.get("*/auth/me", () => {
    return HttpResponse.json({
      data: {
        id: "user-1",
        phone: "0901234567",
        name: "Test User",
        role: "CUSTOMER",
      },
    });
  }),
];
