import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsInt,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';

export class OrderItemDto {
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    productName: string;

    @IsInt()
    @Min(1)
    @Max(100_000_000)
    unitAmount: number; // kobo

    @IsInt()
    @Min(1)
    @Max(1000)
    quantity: number;
}

export class CreateOrderDto {
    // TEMPORARY: once we add auth in Part 14, this comes from the JWT, not the body.
    @IsUUID()
    userId: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(50)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}