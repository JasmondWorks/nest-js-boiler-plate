import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { UserRole } from '../types/user-role.enum';

export class ListUsersQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}