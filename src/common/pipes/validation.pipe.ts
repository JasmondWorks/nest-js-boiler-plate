import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidationException } from '../exceptions/app.exception';
import { FieldError } from '../interfaces/api-error.interface';

export function flattenValidationErrors(
    errors: ValidationError[],
    parentPath = '',
): FieldError[] {
    return errors.flatMap((error) => {
        const field = parentPath ? `${parentPath}.${error.property}` : error.property;

        const own: FieldError[] = error.constraints
            ? [{ field, messages: Object.values(error.constraints) }]
            : [];

        const nested = error.children?.length
            ? flattenValidationErrors(error.children, field)
            : [];

        return [...own, ...nested];
    });
}

export function createValidationPipe(): ValidationPipe {
    return new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors: ValidationError[]) =>
            new ValidationException(flattenValidationErrors(errors)),
    });
}