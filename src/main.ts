import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { createValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  app.useGlobalPipes(createValidationPipe());

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3000);

  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();