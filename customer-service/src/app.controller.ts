import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,

    @Inject('SAGA_CLIENT')
    private readonly sagaClient: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async create(@Body() createCustomerDto: any) {
    const customerId = await this.appService.create(createCustomerDto);

    // Publish a message to the Saga Coordinator to initiate the local transaction
    const message = {
      type: 'CUSTOMER_CREATED',
      payload: {
        customerId,
      },
    };
    await this.sagaClient.emit('saga', message);

    return { customerId };
  }

  @MessagePattern('saga')
  async handleSagaMessage(@Payload() message, @Ctx() context) {
    const originalMessage = context.getMessage();
    switch (message.type) {
      case 'CUSTOMER_CREATED':
        try {
          // Perform the local transaction
          await this.appService.confirmCustomer(message.payload.customerId);
          // Acknowledge the message
          context.getChannelRef().ack(originalMessage);
        } catch (e) {
          // If the local transaction fails, initiate the compensating transaction
          const compensatingMessage = {
            type: 'CUSTOMER_CONFIRMATION_FAILED',
            payload: {
              customerId: message.payload.customerId,
            },
          };
          await this.sagaClient.emit('saga', compensatingMessage);
          // Acknowledge the message
          context.getChannelRef().ack(originalMessage);
        }
        break;
      case 'CUSTOMER_CONFIRMATION_FAILED':
        // Undo the effects of the failed local transaction
        await this.appService.deleteCustomer(message.payload.customerId);
        // Acknowledge the message
        context.getChannelRef().ack(originalMessage);
        break;
    }
  }
}
