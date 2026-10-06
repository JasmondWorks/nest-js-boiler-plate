import { PaginationMeta } from '../interfaces/api-response.interface';

export class Paginated<T> {
    constructor(
        public readonly items: T[],
        public readonly meta: PaginationMeta,
    ) { }

    static of<T>(
        items: T[],
        total: number,
        query: { page: number; limit: number },
    ): Paginated<T> {
        const { page, limit } = query;
        const totalPages = Math.ceil(total / limit);

        return new Paginated(items, {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        });
    }
}