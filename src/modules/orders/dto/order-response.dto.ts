import { Order, OrderItem } from '../types/order.entity';
import { OrderStatus } from '../types/order-status.enum';

export class OrderItemResponseDto {
    id: string;
    productName: string;
    unitAmount: number;
    quantity: number;
    lineTotal: number;

    static fromEntity(item: OrderItem): OrderItemResponseDto {
        const dto = new OrderItemResponseDto();
        dto.id = item.id;
        dto.productName = item.productName;
        dto.unitAmount = item.unitAmount;
        dto.quantity = item.quantity;
        dto.lineTotal = item.unitAmount * item.quantity;
        return dto;
    }
}

export class OrderResponseDto {
    id: string;
    userId: string;
    status: OrderStatus;
    totalAmount: number;
    currency: string;
    items: OrderItemResponseDto[];
    createdAt: Date;

    static fromEntity(order: Order): OrderResponseDto {
        const dto = new OrderResponseDto();
        dto.id = order.id;
        dto.userId = order.userId;
        dto.status = order.status;
        dto.totalAmount = order.totalAmount;
        dto.currency = order.currency;
        dto.items = order.items.map(OrderItemResponseDto.fromEntity);
        dto.createdAt = order.createdAt;
        return dto;
    }
}