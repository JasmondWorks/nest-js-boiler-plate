import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { Paginated } from '../../common/dto/paginated';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage('Order created successfully')
    async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
        const order = await this.ordersService.create(dto);
        return OrderResponseDto.fromEntity(order);
    }

    @Get()
    @ResponseMessage('Orders fetched successfully')
    async findAll(
        @Query() query: ListOrdersQueryDto,
    ): Promise<Paginated<OrderResponseDto>> {
        const { items, total } = await this.ordersService.findAll(query);
        return Paginated.of(items.map(OrderResponseDto.fromEntity), total, query);
    }

    @Get(':id')
    @ResponseMessage('Order fetched successfully')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<OrderResponseDto> {
        const order = await this.ordersService.findOne(id);
        return OrderResponseDto.fromEntity(order);
    }

    @Patch(':id/cancel')
    @ResponseMessage('Order cancelled successfully')
    async cancel(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<OrderResponseDto> {
        const order = await this.ordersService.cancel(id);
        return OrderResponseDto.fromEntity(order);
    }
}