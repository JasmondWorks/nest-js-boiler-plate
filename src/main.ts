import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // strip properties that have no decorator
      forbidNonWhitelisted: true, // ...and reject the request if they were sent
      transform: true,            // turn plain JSON into real DTO class instances
      transformOptions: {
        enableImplicitConversion: true, // "5" -> 5 for numeric query params
      },
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3000);

  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();