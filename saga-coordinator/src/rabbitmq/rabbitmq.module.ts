import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // ClientsModule.register([
    //   {
    //     name: 'orderService',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: ['amqp://localhost'],
    //       queue: 'order-queue',
    //       queueOptions: {
    //         durable: true,
    //       },
    //     },
    //   },
    //   {
    //     name: 'customerService',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: ['amqp://localhost'],
    //       queue: 'customer-queue',
    //       queueOptions: {
    //         durable: true,
    //       },
    //     },
    //   },
    //   {
    //     name: 'stockService',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: ['amqp://localhost'],
    //       queue: 'stock-queue',
    //       queueOptions: {
    //         durable: true,
    //       },
    //     },
    //   },
    // ]),
    ClientsModule.registerAsync([
      {
        name: 'orderService',
        useFactory: async () => ({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost:5672'],
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
            urls: ['amqp://localhost'],
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
            urls: ['amqp://localhost'],
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
            urls: ['amqp://localhost'],
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
