import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory(errors: ValidationError[]) {
    const errorItems = errors.map((err) => {
      const constraintKey = err.constraints
        ? Object.keys(err.constraints)[0]
        : 'unknown';
      const constraintMessage = err.constraints?.[constraintKey] ?? '';
      return {
        field: err.property,
        constraint: constraintKey,
        message: constraintMessage,
      };
    });
    return new BadRequestException({
      message: 'Validation failed',
      errors: errorItems,
    });
  },
});
