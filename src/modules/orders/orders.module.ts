import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ORDERS_REPOSITORY } from './repositories/orders.repository.interface';
import { PrismaOrdersRepository } from './repositories/prisma-orders.repository';

@Module({
  imports: [UsersModule], // gives us access to whatever UsersModule exports
  controllers: [OrdersController],
  providers: [
    OrdersService,
    { provide: ORDERS_REPOSITORY, useClass: PrismaOrdersRepository },
  ],
  exports: [OrdersService], // the ONLY thing other modules may use
})
export class OrdersModule { }