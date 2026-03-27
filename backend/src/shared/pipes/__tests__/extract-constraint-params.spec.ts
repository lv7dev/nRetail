import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEmail,
  IsIn,
  IsNotEmpty,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  validate,
} from 'class-validator';
import { extractConstraintParams } from '../extract-constraint-params';

// Helper: run validation and return the first error for a given property
async function getError(DtoClass: new () => object, value: object) {
  const instance = Object.assign(new DtoClass(), value);
  const errors = await validate(instance);
  return errors[0];
}

// ── minLength ──────────────────────────────────────────────────────────────

class MinLengthDto {
  @MinLength(6)
  field: string;
}

it('minLength → { min: 6 }', async () => {
  const err = await getError(MinLengthDto, { field: 'ab' });
  expect(extractConstraintParams(err, 'minLength')).toEqual({ min: 6 });
});

// ── maxLength ──────────────────────────────────────────────────────────────

class MaxLengthDto {
  @MaxLength(20)
  field: string;
}

it('maxLength → { max: 20 }', async () => {
  const err = await getError(MaxLengthDto, { field: 'a'.repeat(25) });
  expect(extractConstraintParams(err, 'maxLength')).toEqual({ max: 20 });
});

// ── min ────────────────────────────────────────────────────────────────────

class MinDto {
  @Min(0)
  field: number;
}

it('min → { min: 0 }', async () => {
  const err = await getError(MinDto, { field: -1 });
  expect(extractConstraintParams(err, 'min')).toEqual({ min: 0 });
});

// ── max ────────────────────────────────────────────────────────────────────

class MaxDto {
  @Max(100)
  field: number;
}

it('max → { max: 100 }', async () => {
  const err = await getError(MaxDto, { field: 200 });
  expect(extractConstraintParams(err, 'max')).toEqual({ max: 100 });
});

// ── length ─────────────────────────────────────────────────────────────────

class LengthDto {
  @Length(3, 10)
  field: string;
}

it('isLength → { min: 3, max: 10 }', async () => {
  const err = await getError(LengthDto, { field: 'ab' });
  expect(extractConstraintParams(err, 'isLength')).toEqual({ min: 3, max: 10 });
});

// ── arrayMinSize ───────────────────────────────────────────────────────────

class ArrayMinDto {
  @ArrayMinSize(2)
  field: string[];
}

it('arrayMinSize → { min: 2 }', async () => {
  const err = await getError(ArrayMinDto, { field: ['x'] });
  expect(extractConstraintParams(err, 'arrayMinSize')).toEqual({ min: 2 });
});

// ── arrayMaxSize ───────────────────────────────────────────────────────────

class ArrayMaxDto {
  @ArrayMaxSize(5)
  field: string[];
}

it('arrayMaxSize → { max: 5 }', async () => {
  const err = await getError(ArrayMaxDto, { field: new Array(10).fill('x') });
  expect(extractConstraintParams(err, 'arrayMaxSize')).toEqual({ max: 5 });
});

// ── matches ────────────────────────────────────────────────────────────────

class MatchesDto {
  @Matches(/^[0-9]{6}$/)
  field: string;
}

it('matches → { pattern: "/^[0-9]{6}$/" }', async () => {
  const err = await getError(MatchesDto, { field: 'abc' });
  const result = extractConstraintParams(err, 'matches');
  expect(result).toHaveProperty('pattern');
  expect(typeof (result as Record<string, unknown>).pattern).toBe('string');
});

// ── isIn ───────────────────────────────────────────────────────────────────

class IsInDto {
  @IsIn(['a', 'b', 'c'])
  field: string;
}

it('isIn → { values: ["a","b","c"] }', async () => {
  const err = await getError(IsInDto, { field: 'x' });
  expect(extractConstraintParams(err, 'isIn')).toEqual({
    values: ['a', 'b', 'c'],
  });
});

// ── no-param constraints → undefined ──────────────────────────────────────

class NoParamDto {
  @IsNotEmpty()
  field: string;

  @IsEmail()
  email: string;
}

it('isNotEmpty → undefined', async () => {
  const errors = await validate(Object.assign(new NoParamDto(), { field: '', email: 'bad' }));
  const notEmptyErr = errors.find((e) => e.property === 'field')!;
  expect(extractConstraintParams(notEmptyErr, 'isNotEmpty')).toBeUndefined();
});

it('isEmail → undefined', async () => {
  const errors = await validate(Object.assign(new NoParamDto(), { field: 'ok', email: 'bad' }));
  const emailErr = errors.find((e) => e.property === 'email')!;
  expect(extractConstraintParams(emailErr, 'isEmail')).toBeUndefined();
});

// ── unknown constraint → undefined ────────────────────────────────────────

it('unknown constraint key → undefined', async () => {
  const err = await getError(MinLengthDto, { field: 'ab' });
  expect(extractConstraintParams(err, 'someFutureConstraint')).toBeUndefined();
});
