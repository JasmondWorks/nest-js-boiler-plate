import { Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../common/exceptions/app.exception';
import { OrderStatus } from '../orders/types/order-status.enum';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
    constructor(private readonly ordersService: OrdersService) { }

    /** Used in Part 10 before we ask Paystack to start a transaction. */
    async getPayableOrder(orderId: string) {
        const order = await this.ordersService.findOne(orderId);

        if (order.status !== OrderStatus.PENDING) {
            throw new BusinessRuleException(
                'ORDER_NOT_PAYABLE',
                `Order is ${order.status.toLowerCase()} and cannot be paid`,
            );
        }
        return order;
    }
}