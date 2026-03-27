import type { TFunction } from 'i18next';

export class ApiError extends Error {
  status: number;
  code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function resolveApiError(err: unknown, t: TFunction): string {
  if (err instanceof ApiError) {
    if (err.code) {
      return t(`errors.${err.code}`, { defaultValue: err.message });
    }
    return err.message;
  }
  return t('errors.unknown');
}
