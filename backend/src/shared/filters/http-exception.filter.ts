import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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

    // ValidationPipe shape: { statusCode, message: string[], error: 'Bad Request' }
    if (
      typeof exceptionResponse === 'object' &&
      Array.isArray((exceptionResponse as Record<string, unknown>).message)
    ) {
      const messages = (exceptionResponse as Record<string, unknown>)
        .message as string[];
      const errors = messages.map((msg) => {
        const spaceIndex = msg.indexOf(' ');
        return spaceIndex > -1
          ? {
              field: msg.slice(0, spaceIndex),
              message: msg.slice(spaceIndex + 1),
            }
          : { field: 'unknown', message: msg };
      });
      response.status(statusCode).json({
        statusCode,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Business error with object payload — pass through message and optional code
    if (typeof exceptionResponse === 'object') {
      const { message, code } = exceptionResponse as {
        message?: string;
        code?: string;
      };
      response.status(statusCode).json({
        statusCode,
        message: message ?? exception.message,
        ...(code !== undefined ? { code } : {}),
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
