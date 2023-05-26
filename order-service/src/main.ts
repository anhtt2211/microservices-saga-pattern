import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost', 'amqp://guest:guest@rabbitmq:5672'],
        queue: 'order-queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    await app.startAllMicroservices();

    await app.listen(4002, () =>
      Logger.log('Order-Service running on port: ' + 4002, 'Bootstrap'),
    );
  } catch (error) {
    // Handle any errors that occurred during initialization
    Logger.error('Error during bootstrap:', error);
  }
}

bootstrap().catch((error) => {
  // Handle any errors that occurred during bootstrap
  Logger.error('Error during bootstrap:', error);
});
