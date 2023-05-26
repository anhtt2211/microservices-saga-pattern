import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'orderClient',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost', 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'order-queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMq {}
