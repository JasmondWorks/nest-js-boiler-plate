import { Prisma } from '@prisma/client';
import {
    AppException,
    EntityNotFoundException,
    ResourceConflictException,
} from '../../common/exceptions/app.exception';

export function mapPrismaError(error: unknown): AppException | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;

    switch (error.code) {
        case 'P2002': {
            const target = error.meta?.target;
            const fields = Array.isArray(target)
                ? target.join(', ')
                : typeof target === 'string'
                    ? target
                    : null;

            return new ResourceConflictException(
                fields
                    ? `A record with this ${fields} already exists`
                    : 'A record with these details already exists',
                'UNIQUE_CONSTRAINT_VIOLATION',
            );
        }

        case 'P2025':
            return new EntityNotFoundException('Record');

        case 'P2003':
            return new ResourceConflictException(
                'This operation conflicts with related records',
                'RELATED_RECORD_CONFLICT',
            );

        default:
            return null; // unknown Prisma error: let it become a 500
    }
}