import { HttpException, HttpStatus } from '@nestjs/common';
import { FieldError } from '../interfaces/api-error.interface';
import { ErrorCode } from './error-code.enum';

export class AppException extends HttpException {
    constructor(
        public readonly code: string,
        message: string,
        status: HttpStatus,
        public readonly errors?: FieldError[],
    ) {
        super(message, status);
    }
}

/** 400: input failed DTO validation. Thrown by the ValidationPipe (section 4). */
export class ValidationException extends AppException {
    constructor(errors: FieldError[]) {
        super(
            ErrorCode.VALIDATION_FAILED,
            'Validation failed',
            HttpStatus.BAD_REQUEST,
            errors,
        );
    }
}

/** 404: new EntityNotFoundException('User', id) -> code USER_NOT_FOUND */
export class EntityNotFoundException extends AppException {
    constructor(entity: string, id?: string) {
        const code = `${entity.trim().replace(/\s+/g, '_').toUpperCase()}_NOT_FOUND`;
        super(
            code,
            id ? `${entity} ${id} not found` : `${entity} not found`,
            HttpStatus.NOT_FOUND,
        );
    }
}

/** 409: duplicate or conflicting state */
export class ResourceConflictException extends AppException {
    constructor(message: string, code: string = ErrorCode.CONFLICT) {
        super(code, message, HttpStatus.CONFLICT);
    }
}

/** 422: the request is valid, but a business rule says no */
export class BusinessRuleException extends AppException {
    constructor(code: string, message: string) {
        super(code, message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}

/** 502: a third party (Paystack, etc.) failed. Used from Part 10 onward. */
export class ExternalServiceException extends AppException {
    constructor(service: string, message?: string) {
        super(
            ErrorCode.EXTERNAL_SERVICE_ERROR,
            message ?? `${service} request failed`,
            HttpStatus.BAD_GATEWAY,
        );
    }
}