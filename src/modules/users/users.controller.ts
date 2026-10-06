import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Paginated } from '../../common/dto/paginated';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('User created successfully')
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(dto);
    return UserResponseDto.fromEntity(user);
  }

  @Get()
  @ResponseMessage('Users fetched successfully')
  async findAll(
    @Query() query: ListUsersQueryDto,
  ): Promise<Paginated<UserResponseDto>> {
    const { items, total } = await this.usersService.findAll(query);
    return Paginated.of(items.map(UserResponseDto.fromEntity), total, query);
  }

  @Get(':id')
  @ResponseMessage('User fetched successfully')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return UserResponseDto.fromEntity(user);
  }

  @Patch(':id')
  @ResponseMessage('User updated successfully')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, dto);
    return UserResponseDto.fromEntity(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}