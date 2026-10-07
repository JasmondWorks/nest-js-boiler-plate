import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { OrderStatus } from '../types/order-status.enum';

export class ListOrdersQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}