import { User } from '../types/user.entity';
import { UserRole } from '../types/user-role.enum';

export class UserResponseDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;

    static fromEntity(user: User): UserResponseDto {
        const dto = new UserResponseDto();
        dto.id = user.id;
        dto.email = user.email;
        dto.name = user.name;
        dto.role = user.role;
        dto.createdAt = user.createdAt;
        return dto;
    }
}