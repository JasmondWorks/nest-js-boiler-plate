import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor,
    StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { Paginated } from '../dto/paginated';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { SKIP_RESPONSE_WRAP_KEY } from '../decorators/skip-response-wrap.decorator';
import {
    ApiResponse,
    PaginatedResponse,
} from '../interfaces/api-response.interface';

type Wrapped = ApiResponse<unknown> | PaginatedResponse<unknown>;

@Injectable()
export class ResponseInterceptor implements NestInterceptor<unknown, unknown> {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        // Only wrap HTTP. Leave queues, cron, websockets alone.
        if (context.getType() !== 'http') return next.handle();

        const targets = [context.getHandler(), context.getClass()];

        const skip = this.reflector.getAllAndOverride<boolean>(
            SKIP_RESPONSE_WRAP_KEY,
            targets,
        );
        if (skip) return next.handle();

        const message =
            this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, targets) ??
            'Success';

        const res = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(
            map((result: unknown): unknown => {
                // 204 must have no body, files/streams must stay raw
                if (res.statusCode === HttpStatus.NO_CONTENT) return result;
                if (result instanceof StreamableFile) return result;

                return this.wrap(result, message);
            }),
        );
    }

    private wrap(result: unknown, message: string): Wrapped {
        if (result instanceof Paginated) {
            return {
                success: true,
                message,
                data: result.items,
                meta: result.meta,
            };
        }

        return {
            success: true,
            message,
            data: result ?? null, // void handlers become data: null
        };
    }
}