import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(4001, () =>
    Logger.log('Stock-Service running on port: ' + 4001, 'Bootstrap'),
  );
}
bootstrap();
