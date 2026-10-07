import { Inject, Injectable } from '@nestjs/common';
import {
    BusinessRuleException,
    EntityNotFoundException,
} from '../../common/exceptions/app.exception';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { Order } from './types/order.entity';
import { OrderStatus } from './types/order-status.enum';
import {
    ORDERS_REPOSITORY,
    OrdersRepository,
} from './repositories/orders.repository.interface';

const CURRENCY = 'NGN';
const MAX_ORDER_TOTAL = 2_000_000_000; // stays inside Postgres Int

@Injectable()
export class OrdersService {
    constructor(
        @Inject(ORDERS_REPOSITORY)
        private readonly ordersRepo: OrdersRepository,
        private readonly usersService: UsersService, // from UsersModule's exports
    ) { }

    async create(dto: CreateOrderDto): Promise<Order> {
        await this.usersService.findOne(dto.userId); // 404 if the user doesn't exist

        const totalAmount = dto.items.reduce(
            (sum, item) => sum + item.unitAmount * item.quantity,
            0,
        );

        if (totalAmount > MAX_ORDER_TOTAL) {
            throw new BusinessRuleException(
                'ORDER_TOTAL_TOO_LARGE',
                'Order total exceeds the maximum allowed amount',
            );
        }

        return this.ordersRepo.create({
            userId: dto.userId,
            totalAmount,
            currency: CURRENCY,
            items: dto.items.map(({ productName, unitAmount, quantity }) => ({
                productName,
                unitAmount,
                quantity,
            })),
        });
    }

    findAll(query: ListOrdersQueryDto): Promise<PaginatedResult<Order>> {
        const { page, limit, userId, status } = query;
        return this.ordersRepo.findMany({ page, limit, userId, status });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.ordersRepo.findById(id);
        if (!order) throw new EntityNotFoundException('Order', id);
        return order;
    }

    /** Called by the payments module once money has actually been received. */
    async markAsPaid(id: string): Promise<Order> {
        const order = await this.findOne(id);

        if (order.status === OrderStatus.PAID) return order; // idempotent
        if (order.status !== OrderStatus.PENDING) {
            throw new BusinessRuleException(
                'ORDER_NOT_PAYABLE',
                `Order is ${order.status.toLowerCase()} and cannot be paid`,
            );
        }

        return this.ordersRepo.updateStatus(id, OrderStatus.PAID);
    }

    async cancel(id: string): Promise<Order> {
        const order = await this.findOne(id);

        if (order.status !== OrderStatus.PENDING) {
            throw new BusinessRuleException(
                'ORDER_NOT_CANCELLABLE',
                `Only pending orders can be cancelled (this one is ${order.status.toLowerCase()})`,
            );
        }

        return this.ordersRepo.updateStatus(id, OrderStatus.CANCELLED);
    }
}