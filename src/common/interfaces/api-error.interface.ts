import { ApiResponse, PaginatedResponse } from './api-response.interface';

export interface FieldError {
    field: string;
    messages: string[];
}

export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    code: string;
    message: string;
    errors?: FieldError[];
    path: string;
    timestamp: string;
}

// What any endpoint can return. TypeScript clients narrow on `success`.
export type ApiResult<T> = ApiResponse<T> | PaginatedResponse<T> | ApiErrorResponse;