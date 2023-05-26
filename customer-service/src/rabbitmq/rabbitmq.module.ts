import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'customerClient',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost', 'amqp://guest:guest@rabbitmq:5672'],
          queue: 'customer-queue',
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
