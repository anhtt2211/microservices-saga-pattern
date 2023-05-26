import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'orderService',
        useFactory: async () => ({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost', 'amqp://guest:guest@rabbitmq:5672'],
            queue: 'order-queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
      {
        name: 'customerService',
        useFactory: async () => ({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost', 'amqp://guest:guest@rabbitmq:5672'],
            queue: 'customer-queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
      {
        name: 'stockService',
        useFactory: async () => ({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost', 'amqp://guest:guest@rabbitmq:5672'],
            queue: 'stock-queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
      {
        name: 'sagaService',
        useFactory: async () => ({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost', 'amqp://guest:guest@rabbitmq:5672'],
            queue: 'sec-queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMq {}
