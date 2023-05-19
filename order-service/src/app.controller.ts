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
  async create(@Body() createOrderDto: any) {
    const orderId = await this.appService.create(createOrderDto);

    // Publish a message to the Saga Coordinator to initiate the local transaction
    const message = {
      type: 'ORDER_CREATED',
      payload: {
        orderId,
        customerId: createOrderDto.customerId,
        stockId: createOrderDto.stockId,
      },
    };
    await this.sagaClient.emit('saga', message);

    return { orderId };
  }
  @MessagePattern('saga')
  async handleSagaMessage(@Payload() message, @Ctx() context) {
    const originalMessage = context.getMessage();
    switch (message.type) {
      case 'ORDER_CREATED':
        try {
          // Perform the local transaction
          await this.appService.confirmOrder(message.payload.orderId);
          // Acknowledge the message
          context.getChannelRef().ack(originalMessage);
        } catch (e) {
          // If the local transaction fails, initiate the compensating transaction
          const compensatingMessage = {
            type: 'ORDER_CONFIRMATION_FAILED',
            payload: {
              orderId: message.payload.orderId,
            },
          };
          await this.sagaClient.emit('saga', compensatingMessage);
          // Acknowledge the message
          context.getChannelRef().ack(originalMessage);
        }
        break;
      case 'ORDER_CONFIRMATION_FAILED':
        // Undo the effects of the failed local transaction
        await this.appService.cancelOrder(message.payload.orderId);
        // Acknowledge the message
        context.getChannelRef().ack(originalMessage);
        break;
    }
  }
}
