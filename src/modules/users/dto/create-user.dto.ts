import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { UserRole } from '@/modules/users/types/user-role.enum';

const trim = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

export class CreateUserDto {
    @IsEmail()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    email: string;

    @IsString()
    @MinLength(2)
    @MaxLength(80)
    @Transform(trim)
    name: string;

    @IsString()
    @MinLength(8)
    @MaxLength(64)
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}