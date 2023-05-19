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
  async create(@Body() createStockDto: any) {
    const stockId = await this.appService.create(createStockDto);

    // Publish a message to the Saga Coordinator to initiate the local transaction
    const message = {
      type: 'STOCK_CREATED',
      payload: {
        stockId,
      },
    };
    await this.sagaClient.emit('saga', message);

    return { stockId };
  }

  @MessagePattern('saga')
  async handleSagaMessage(@Payload() message, @Ctx() context) {
    const originalMessage = context.getMessage();
    switch (message.type) {
      case 'STOCK_CREATED':
        try {
          // Perform the local transaction
          await this.appService.confirmStock(message.payload.stockId);
          // Acknowledge the message
          context.getChannelRef().ack(originalMessage);
        } catch (e) {
          // If the local transaction fails, initiate the compensating transaction
          const compensatingMessage = {
            type: 'STOCK_CONFIRMATION_FAILED',
            payload: {
              stockId: message.payload.stockId,
            },
          };
          await this.sagaClient.emit('saga', compensatingMessage);
          // Acknowledge the message
          context.getChannelRef().ack(originalMessage);
        }
        break;
      case 'STOCK_CONFIRMATION_FAILED':
        // Undo the effects of the failed local transaction
        await this.appService.deleteStock(message.payload.stockId);
        // Acknowledge the message
        context.getChannelRef().ack(originalMessage);
        break;
    }
  }
}
