import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { USERS_REPOSITORY } from './repositories/users.repository.interface';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      inject: [ConfigService, PrismaService],
      useFactory: (config: ConfigService, prisma: PrismaService) =>
        config.get('app.env') === 'test'
          ? new InMemoryUsersRepository()
          : new PrismaUsersRepository(prisma),
    }
    // { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule { }