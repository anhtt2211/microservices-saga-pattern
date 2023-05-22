import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(4002, () =>
    Logger.log('Order-Service running on port: ' + 4002, 'Bootstrap'),
  );
}
bootstrap();
