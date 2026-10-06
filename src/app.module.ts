import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { configurations, validateEnv } from './config';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configurations,
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule { }