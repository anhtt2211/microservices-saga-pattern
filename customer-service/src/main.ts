import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost'],
        queue: 'customer-queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    await app.startAllMicroservices();

    await app.listen(4003, () =>
      Logger.log('Customer-Service running on port: ' + 4003, 'Bootstrap'),
    );
  } catch (error) {
    Logger.error('Error during bootstrap:', error);
  }
}

bootstrap().catch((error) => {
  // Handle any errors that occurred during bootstrap
  Logger.error('Error during bootstrap:', error);
});
