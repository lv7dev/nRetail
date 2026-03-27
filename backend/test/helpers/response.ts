import type { Response } from 'supertest';
import type { ErrorResponse } from '../../src/modules/auth/dto/auth.response';
import type { ResponseShape } from '../../src/shared/interceptors/response.interceptor';

/**
 * Unwraps the `{ data: T }` envelope from a successful supertest response.
 *
 * The ResponseInterceptor wraps all success responses in { data: T }.
 * This helper casts res.body and returns the inner data typed as T,
 * keeping the unsafe `as` cast in one place instead of scattered across tests.
 */
export function parseData<T>(res: Response): T {
  return (res.body as ResponseShape<T>).data;
}

/**
 * Casts a supertest error response body as ErrorResponse.
 *
 * Error responses from AllExceptionsFilter are NOT wrapped in { data: T }.
 * They have the shape: { statusCode, message, code }.
 */
export function parseError(res: Response): ErrorResponse {
  return res.body as ErrorResponse;
}
