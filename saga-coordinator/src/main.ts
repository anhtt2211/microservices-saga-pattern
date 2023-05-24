// main.ts

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'queue-saga',
      queueOptions: {
        durable: true,
      },
      connectionOptions: {
        timeout: 10000, // Adjust the timeout value as needed (in milliseconds)
        // Add other connection options if required
      },
    },
  });

  await app.listen();
}

bootstrap();
