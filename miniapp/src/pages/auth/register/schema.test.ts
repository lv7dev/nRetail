import { describe, it, expect } from 'vitest';
import { phoneSchema, registerCompleteSchema } from './schema';

const t = (k: string) => k;

describe('phoneSchema', () => {
  const schema = phoneSchema(t);

  it('accepts a valid Vietnamese phone number', () => {
    expect(schema.safeParse({ phone: '0901234567' }).success).toBe(true);
  });

  it('rejects a phone not matching the regex', () => {
    const result = schema.safeParse({ phone: '1234567890' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.phone');
    }
  });
});

describe('registerCompleteSchema', () => {
  const schema = registerCompleteSchema(t);

  it('accepts when passwords match', () => {
    expect(
      schema.safeParse({ name: 'Alice', password: 'secret1', confirmPassword: 'secret1' }).success,
    ).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const result = schema.safeParse({
      name: 'Alice',
      password: 'secret1',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.passwordMismatch');
    }
  });
});
