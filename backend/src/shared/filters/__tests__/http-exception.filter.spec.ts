import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { AllExceptionsFilter } from '../http-exception.filter';

function makeHost(url = '/test') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const mockResponse = { status };
  const mockRequest = { url };
  const mockHttp = {
    getResponse: () => mockResponse,
    getRequest: () => mockRequest,
  };
  const host = { switchToHttp: () => mockHttp } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
  });

  it('passes through structured validation errors with constraint field', () => {
    const exception = new BadRequestException({
      message: 'Validation failed',
      errors: [
        {
          field: 'password',
          constraint: 'minLength',
          message: 'password must be longer than or equal to 6 characters',
        },
        {
          field: 'phone',
          constraint: 'isNotEmpty',
          message: 'phone should not be empty',
        },
      ],
    });
    const { host, status, json } = makeHost();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Validation failed',
        errors: [
          {
            field: 'password',
            constraint: 'minLength',
            message: 'password must be longer than or equal to 6 characters',
          },
          {
            field: 'phone',
            constraint: 'isNotEmpty',
            message: 'phone should not be empty',
          },
        ],
      }),
    );
  });

  it('passes through message and code for business errors with object payload', () => {
    const exception = new ConflictException({
      message: 'Phone number already registered',
      code: 'PHONE_ALREADY_EXISTS',
    });
    const { host, status, json } = makeHost();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'Phone number already registered',
        code: 'PHONE_ALREADY_EXISTS',
      }),
    );
  });

  it('handles plain string HttpException without code', () => {
    const exception = new NotFoundException('Resource not found');
    const { host, status, json } = makeHost();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Resource not found',
      }),
    );
    expect((json.mock.calls as [unknown[]][])[0][0]).not.toHaveProperty('code');
  });

  it('returns 500 for unknown non-HttpException errors', () => {
    const exception = new Error('Something exploded');
    const { host, status, json } = makeHost();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('returns 429 with code RATE_LIMIT_EXCEEDED for ThrottlerException', () => {
    const exception = new ThrottlerException();
    const { host, status, json } = makeHost('/auth/otp/register');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        path: '/auth/otp/register',
      }),
    );
  });

  it('does not include code in response when business error has no code', () => {
    const exception = new UnauthorizedException('Invalid credentials');
    const { host, status, json } = makeHost();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(401);
    const body = (json.mock.calls as [unknown[]][])[0][0] as unknown as Record<string, unknown>;
    expect(body.message).toBe('Invalid credentials');
    expect(body).not.toHaveProperty('code');
  });
});
