import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SAGA_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost'],
          queue: 'queue-saga',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SagaModule {}
