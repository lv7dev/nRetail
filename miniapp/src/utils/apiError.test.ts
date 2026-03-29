import { describe, it, expect, vi } from 'vitest';
import { ApiError, resolveApiError } from './apiError';
import type { TFunction } from 'i18next';

const t = vi.fn((key: string) => key) as unknown as TFunction;

describe('ApiError', () => {
  it('carries status, message, and code', () => {
    const err = new ApiError(401, 'Unauthorized', 'INVALID_CREDENTIALS');
    expect(err.status).toBe(401);
    expect(err.message).toBe('Unauthorized');
    expect(err.code).toBe('INVALID_CREDENTIALS');
    expect(err.name).toBe('ApiError');
  });

  it('works without code', () => {
    const err = new ApiError(500, 'Server error');
    expect(err.code).toBeUndefined();
  });

  it('is an instance of Error', () => {
    expect(new ApiError(400, 'bad')).toBeInstanceOf(Error);
  });
});

describe('resolveApiError', () => {
  beforeEach(() => vi.mocked(t).mockClear());

  it('returns translated key when ApiError has code', () => {
    const err = new ApiError(401, 'Unauthorized', 'INVALID_CREDENTIALS');
    const result = resolveApiError(err, t);
    expect(t).toHaveBeenCalledWith('errors.INVALID_CREDENTIALS', {
      defaultValue: 'Unauthorized',
    });
    expect(result).toBe('errors.INVALID_CREDENTIALS');
  });

  it('returns message directly when ApiError has no code', () => {
    const err = new ApiError(400, 'Bad input');
    const result = resolveApiError(err, t);
    expect(result).toBe('Bad input');
    expect(t).not.toHaveBeenCalled();
  });

  it('returns errors.unknown for non-ApiError', () => {
    const result = resolveApiError(new Error('Something'), t);
    expect(t).toHaveBeenCalledWith('errors.unknown');
    expect(result).toBe('errors.unknown');
  });

  it('returns errors.unknown for plain object', () => {
    resolveApiError({ message: 'oops' }, t);
    expect(t).toHaveBeenCalledWith('errors.unknown');
  });
});
