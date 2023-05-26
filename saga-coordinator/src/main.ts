// main.ts

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { snapshot: true });

    // connect to own queue
    app.connectMicroservice(
      {
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost', 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'sec-queue',
          queueOptions: {
            durable: true,
          },
          connectionOptions: {
            timeout: 10000,
          },
        },
      },
      { inheritAppConfig: true },
    );

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
