import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ResourceConflictException } from '@/common/exceptions/app.exception';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { User } from './types/user.entity';
import { UserRole } from './types/user-role.enum';
import {
  PaginatedResult,
  USERS_REPOSITORY,
  type UsersRepository,
} from './repositories/users.repository.interface';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepo: UsersRepository,
  ) { }

  async create(dto: CreateUserDto): Promise<User> {
    await this.assertEmailAvailable(dto.email);

    return this.usersRepo.create({
      email: dto.email,
      name: dto.name,
      role: dto.role ?? UserRole.USER,
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    });
  }

  findAll(query: ListUsersQueryDto): Promise<PaginatedResult<User>> {
    const { page, limit, search, role } = query;
    return this.usersRepo.findMany({ page, limit, search, role });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.findOne(id);

    if (dto.email && dto.email !== existing.email) {
      await this.assertEmailAvailable(dto.email);
    }

    return this.usersRepo.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // 404 if missing
    await this.usersRepo.delete(id);
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const taken = await this.usersRepo.findByEmail(email);
    if (taken) {
      throw new ResourceConflictException('A user with this email already exists');
    }
  }
}