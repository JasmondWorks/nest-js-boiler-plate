import { Injectable } from "@nestjs/common";
import { User } from "../types/user.entity";
import { CreateUserData, FindUsersParams, PaginatedResult, UpdateUserData, UsersRepository } from "./users.repository.interface";

@Injectable()
export class InMemoryUsersRepository implements UsersRepository {
    private rows: User[] = [];

    async findById(id: string) { return this.rows.find((u) => u.id === id) ?? null; }

    async findByEmail(email: string): Promise<User | null> {
        return this.rows.find((u) => u.email === email) ?? null;
    }

    async create(data: CreateUserData): Promise<User> {
        const user: User = {
            ...data,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.rows.push(user);
        return user;
    }

    async findMany(params: FindUsersParams): Promise<PaginatedResult<User>> {
        const { page, limit, search, role } = params;
        let filtered = this.rows;

        if (search) {
            filtered = filtered.filter((u) =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()),
            );
        }

        if (role) {
            filtered = filtered.filter((u) => u.role === role);
        }

        const total = filtered.length;
        const items = filtered.slice((page - 1) * limit, page * limit);

        return { items, total };
    }

    async update(id: string, data: UpdateUserData): Promise<User> {
        const index = this.rows.findIndex((u) => u.id === id);
        if (index === -1) throw new Error('User not found');

        this.rows[index] = { ...this.rows[index], ...data, updatedAt: new Date() };
        return this.rows[index];
    }

    async delete(id: string): Promise<void> {
        const index = this.rows.findIndex((u) => u.id === id);
        if (index === -1) throw new Error('User not found');
        this.rows.splice(index, 1);
    }
}