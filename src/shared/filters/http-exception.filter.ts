import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MulterError } from 'multer';
import {
  AmenityNotFoundError,
  InvalidCsvError,
  UnsupportedMediaTypeError,
} from '../errors/app.errors';
import type { ErrorResponse, ResolvedError } from '../types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { status, message } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error({ err: exception }, message);
    }

    const body: ErrorResponse = {
      statusCode: status,
      message,
      requestId: req.headers['x-request-id'] as string | undefined,
      timestamp: new Date().toISOString(),
      path: req.url,
    };

    res.status(status).json(body);
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof MulterError) {
      if (exception.code === 'LIMIT_FILE_SIZE') {
        return {
          status: HttpStatus.PAYLOAD_TOO_LARGE,
          message: 'File too large',
        };
      }
      return { status: HttpStatus.BAD_REQUEST, message: exception.message };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : typeof response === 'object' &&
              response !== null &&
              'message' in response
            ? String((response as { message: string | string[] }).message)
            : exception.message;
      return { status: exception.getStatus(), message };
    }

    if (exception instanceof AmenityNotFoundError) {
      return { status: HttpStatus.NOT_FOUND, message: exception.message };
    }

    if (exception instanceof InvalidCsvError) {
      return { status: HttpStatus.BAD_REQUEST, message: exception.message };
    }

    if (exception instanceof UnsupportedMediaTypeError) {
      return {
        status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        message: exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
