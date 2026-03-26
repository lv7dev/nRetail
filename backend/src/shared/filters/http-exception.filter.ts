import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof ThrottlerException) {
      response.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Structured object payload — pass through message, errors, and optional code
    if (typeof exceptionResponse === 'object') {
      const payload = exceptionResponse as {
        message?: string;
        errors?: unknown[];
        code?: string;
      };
      response.status(statusCode).json({
        statusCode,
        message: payload.message ?? exception.message,
        ...(payload.errors !== undefined ? { errors: payload.errors } : {}),
        ...(payload.code !== undefined ? { code: payload.code } : {}),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Plain string response
    response.status(statusCode).json({
      statusCode,
      message: exceptionResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
