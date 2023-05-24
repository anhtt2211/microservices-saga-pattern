// main.ts

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // connect to order-service
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'order-queue',
        queueOptions: {
          durable: true,
        },
        connectionOptions: {
          timeout: 10000,
        },
      },
    });

    // connect to customer-service
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'customer-queue',
        queueOptions: {
          durable: true,
        },
        connectionOptions: {
          timeout: 10000,
        },
      },
    });

    // connect to stock-service
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'stock-queue',
        queueOptions: {
          durable: true,
        },
        connectionOptions: {
          timeout: 10000,
        },
      },
    });

    await app.startAllMicroservices();
    await app.listen(4000, () =>
      Logger.log(
        'Saga-Coordinator-Service running on port: ' + 4000,
        'Bootstrap',
      ),
    );
  } catch (error) {
    Logger.error('Error during bootstrap:', error);
  }
}

bootstrap().catch((error) => {
  // Handle any errors that occurred during bootstrap
  Logger.error('Error during bootstrap:', error);
});
