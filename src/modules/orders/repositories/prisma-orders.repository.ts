import { Injectable } from '@nestjs/common';
import { OrderStatus as PrismaOrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { Order } from '../types/order.entity';
import { OrderStatus } from '../types/order-status.enum';
import {
    CreateOrderData,
    FindOrdersParams,
    OrdersRepository,
} from './orders.repository.interface';

type OrderRow = Prisma.OrderGetPayload<{ include: { items: true } }>;

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateOrderData): Promise<Order> {
        // A nested create runs inside ONE database transaction automatically.
        // If any item fails, the order is not created either.
        const row = await this.prisma.order.create({
            data: {
                userId: data.userId,
                totalAmount: data.totalAmount,
                currency: data.currency,
                items: { create: data.items },
            },
            include: { items: true },
        });
        return this.toEntity(row);
    }

    async findById(id: string): Promise<Order | null> {
        const row = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        return row ? this.toEntity(row) : null;
    }

    async findMany(params: FindOrdersParams): Promise<PaginatedResult<Order>> {
        const { page, limit, userId, status } = params;

        const where: Prisma.OrderWhereInput = {
            ...(userId && { userId }),
            ...(status && { status: status as PrismaOrderStatus }),
        };

        const [rows, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                include: { items: true },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { items: rows.map((r) => this.toEntity(r)), total };
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const row = await this.prisma.order.update({
            where: { id },
            data: { status: status as PrismaOrderStatus },
            include: { items: true },
        });
        return this.toEntity(row);
    }

    private toEntity(row: OrderRow): Order {
        return {
            id: row.id,
            userId: row.userId,
            status: row.status as OrderStatus,
            totalAmount: row.totalAmount,
            currency: row.currency,
            items: row.items.map((i) => ({
                id: i.id,
                productName: i.productName,
                unitAmount: i.unitAmount,
                quantity: i.quantity,
            })),
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
}