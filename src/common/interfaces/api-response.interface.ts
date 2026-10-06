export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
    success: true;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: true;
    message: string;
    data: T[];
    meta: PaginationMeta;
}