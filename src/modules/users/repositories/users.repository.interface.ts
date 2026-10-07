import { User } from '../types/user.entity';
import { UserRole } from '../types/user-role.enum';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface CreateUserData {
    email: string;
    name: string;
    passwordHash: string;
    role: UserRole;
}

export interface UpdateUserData {
    email?: string;
    name?: string;
}

export interface FindUsersParams {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
}

export interface UsersRepository {
    create(data: CreateUserData): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findMany(params: FindUsersParams): Promise<PaginatedResult<User>>;
    update(id: string, data: UpdateUserData): Promise<User>;
    delete(id: string): Promise<void>;
}