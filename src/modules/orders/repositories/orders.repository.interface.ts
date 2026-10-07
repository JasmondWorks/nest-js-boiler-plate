import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { Order } from '../types/order.entity';
import { OrderStatus } from '../types/order-status.enum';

export const ORDERS_REPOSITORY = Symbol('ORDERS_REPOSITORY');

export interface CreateOrderData {
    userId: string;
    totalAmount: number;
    currency: string;
    items: { productName: string; unitAmount: number; quantity: number }[];
}

export interface FindOrdersParams {
    page: number;
    limit: number;
    userId?: string;
    status?: OrderStatus;
}

export interface OrdersRepository {
    create(data: CreateOrderData): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findMany(params: FindOrdersParams): Promise<PaginatedResult<Order>>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
}