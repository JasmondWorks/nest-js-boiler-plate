import { OrderStatus } from '../types/order-status.enum';

export interface OrderItem {
    id: string;
    productName: string;
    unitAmount: number; // kobo
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    totalAmount: number; // kobo
    currency: string;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}