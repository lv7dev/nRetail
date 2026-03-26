import { BadRequestException } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { globalValidationPipe } from '../validation.pipe';
import { ArgumentMetadata } from '@nestjs/common';

class TestDto {
  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

const metadata: ArgumentMetadata = { type: 'body', metatype: TestDto };

describe('globalValidationPipe', () => {
  it('throws BadRequestException with constraint field when a field fails validation', async () => {
    let caught: BadRequestException | undefined;
    try {
      await globalValidationPipe.transform(
        { password: 'abc', name: 'test' },
        metadata,
      );
    } catch (e) {
      caught = e as BadRequestException;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    const body = caught!.getResponse() as Record<string, unknown>;
    expect(body.message).toBe('Validation failed');
    const errors = body.errors as Array<Record<string, unknown>>;
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('password');
    expect(errors[0].constraint).toBe('minLength');
    expect(typeof errors[0].message).toBe('string');
  });

  it('includes all failing fields when multiple fields fail', async () => {
    let caught: BadRequestException | undefined;
    try {
      await globalValidationPipe.transform(
        { password: 'ab', name: '' },
        metadata,
      );
    } catch (e) {
      caught = e as BadRequestException;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    const body = caught!.getResponse() as Record<string, unknown>;
    const errors = body.errors as Array<Record<string, unknown>>;
    const fields = errors.map((e) => e.field);
    expect(fields).toContain('password');
    expect(fields).toContain('name');
    for (const err of errors) {
      expect(err).toHaveProperty('constraint');
    }
  });

  it('does not throw when all fields are valid', async () => {
    await expect(
      globalValidationPipe.transform(
        { password: 'abcdef', name: 'Alice' },
        metadata,
      ),
    ).resolves.not.toThrow();
  });
});
