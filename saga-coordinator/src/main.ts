// main.ts

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import cluster from 'cluster';
import { cpus } from 'os';

async function bootstrap() {
  try {
    if (cluster.isPrimary) {
      console.log(`Primary ${process.pid} is running`);

      // Fork workers, just separate 2 worker for test
      // Need convert 2 -> cpus().length
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
    }
  } catch (error) {
    Logger.error('Error during bootstrap:', error);
  }
}

bootstrap().catch((error) => {
  // Handle any errors that occurred during bootstrap
  Logger.error('Error during bootstrap:', error);
});
