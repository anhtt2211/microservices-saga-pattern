import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import cluster from 'cluster';
import { cpus } from 'os';

async function bootstrap() {
  try {
    if (cluster.isPrimary) {
      console.log(`Primary ${process.pid} is running`);

      // Fork workers, just separate 2 worker for test
      for (let i = 0; i < 2; i++) {
        cluster.fork();
      }

      cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is online`);
      });

      cluster.on('exit', (worker, code, signal) => {
        console.log(
          `Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`,
        );
        console.log('Starting a new worker');
        cluster.fork();
      });
    } else {
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

      await app.listen(4001, () =>
        Logger.log('Order-Service running on port: ' + 4001, 'Bootstrap'),
      );
    }
  } catch (error) {
    // Handle any errors that occurred during initialization
    Logger.error('Error during bootstrap:', error);
  }
}

bootstrap().catch((error) => {
  // Handle any errors that occurred during bootstrap
  Logger.error('Error during bootstrap:', error);
});
