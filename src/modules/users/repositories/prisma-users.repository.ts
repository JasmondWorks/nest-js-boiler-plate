import { Injectable } from '@nestjs/common';
import { Prisma, User as UserRow, UserRole as PrismaUserRole } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { User } from '../types/user.entity';
import { UserRole } from '../types/user-role.enum';
import {
    CreateUserData,
    FindUsersParams,
    UpdateUserData,
    UsersRepository,
} from './users.repository.interface';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateUserData): Promise<User> {
        const row = await this.prisma.user.create({
            data: { ...data, role: data.role as PrismaUserRole },
        });
        return this.toEntity(row);
    }

    async findById(id: string): Promise<User | null> {
        const row = await this.prisma.user.findUnique({ where: { id } });
        return row ? this.toEntity(row) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const row = await this.prisma.user.findUnique({ where: { email } });
        return row ? this.toEntity(row) : null;
    }

    async findMany(params: FindUsersParams): Promise<PaginatedResult<User>> {
        const { page, limit, search, role } = params;

        const where: Prisma.UserWhereInput = {
            ...(role && { role: role as PrismaUserRole }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        // One round trip, one consistent snapshot
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { items: rows.map((r) => this.toEntity(r)), total };
    }

    async update(id: string, data: UpdateUserData): Promise<User> {
        const row = await this.prisma.user.update({ where: { id }, data });
        return this.toEntity(row);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
    }

    // Prisma row -> our domain entity. Prisma types stop at this file.
    private toEntity(row: UserRow): User {
        return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role as UserRole,
            passwordHash: row.passwordHash,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
}