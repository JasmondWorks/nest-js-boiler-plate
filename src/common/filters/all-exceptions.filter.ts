import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { mapPrismaError } from '../../infrastructure/database/prisma-error.mapper';
import { AppException } from '../exceptions/app.exception';
import { ErrorCode } from '../exceptions/error-code.enum';
import {
    ApiErrorResponse,
    FieldError,
} from '../interfaces/api-error.interface';

interface NormalizedError {
    statusCode: number;
    code: string;
    message: string;
    errors?: FieldError[];
}

const STATUS_TO_CODE: Partial<Record<number, ErrorCode>> = {
    400: ErrorCode.BAD_REQUEST,
    401: ErrorCode.UNAUTHORIZED,
    403: ErrorCode.FORBIDDEN,
    404: ErrorCode.NOT_FOUND,
    409: ErrorCode.CONFLICT,
    429: ErrorCode.TOO_MANY_REQUESTS,
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        // This filter only knows how to answer HTTP requests
        if (host.getType() !== 'http') {
            this.logger.error(
                'Unhandled exception outside HTTP context',
                exception instanceof Error ? exception.stack : String(exception),
            );
            return;
        }

        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request: unknown = ctx.getRequest();

        const { statusCode, code, message, errors } = this.normalize(exception);

        const method = httpAdapter.getRequestMethod(request);
        const url = httpAdapter.getRequestUrl(request);

        if (statusCode >= 500) {
            this.logger.error(
                `${method} ${url} -> ${statusCode} ${code}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        } else {
            this.logger.warn(`${method} ${url} -> ${statusCode} ${code}: ${message}`);
        }

        const body: ApiErrorResponse = {
            success: false,
            statusCode,
            code,
            message,
            ...(errors?.length ? { errors } : {}),
            path: url,
            timestamp: new Date().toISOString(),
        };

        httpAdapter.reply(ctx.getResponse(), body, statusCode);
    }

    private normalize(exception: unknown): NormalizedError {
        // 1. Our own exceptions already carry everything we need
        if (exception instanceof AppException) {
            return {
                statusCode: exception.getStatus(),
                code: exception.code,
                message: exception.message,
                errors: exception.errors,
            };
        }

        // 2. Known Prisma errors -> mapped to an AppException
        const mapped = mapPrismaError(exception);
        if (mapped) return this.normalize(mapped);

        // 3. Nest built-ins (NotFoundException, ParseUUIDPipe's 400, guards' 401/403...)
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            return {
                statusCode: status,
                code: this.codeFor(status),
                message: this.extractMessage(exception),
            };
        }

        // 4. Client errors thrown by Express itself (bad JSON, body too large)
        const clientError = this.asClientError(exception);
        if (clientError) return clientError;

        // 5. Anything else is a bug. Never leak details.
        return {
            statusCode: 500,
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Internal server error',
        };
    }

    private codeFor(status: number): string {
        return (
            STATUS_TO_CODE[status] ??
            (status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST)
        );
    }

    private extractMessage(exception: HttpException): string {
        const res = exception.getResponse();
        if (typeof res === 'string') return res;

        const message = (res as { message?: string | string[] }).message;
        if (Array.isArray(message)) return message.join(', ');
        return message ?? exception.message;
    }

    private asClientError(exception: unknown): NormalizedError | null {
        if (typeof exception !== 'object' || exception === null) return null;

        const e = exception as {
            status?: unknown;
            statusCode?: unknown;
            type?: unknown;
            message?: unknown;
        };

        const status =
            typeof e.statusCode === 'number'
                ? e.statusCode
                : typeof e.status === 'number'
                    ? e.status
                    : null;

        if (status === null || status < 400 || status >= 500) return null;

        const message =
            e.type === 'entity.parse.failed'
                ? 'Malformed JSON body'
                : typeof e.message === 'string'
                    ? e.message
                    : 'Bad request';

        return { statusCode: status, code: this.codeFor(status), message };
    }
}