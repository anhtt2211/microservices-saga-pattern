import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { ICreateOrderDto } from './order.interface';
import { OrderService } from './order.service';

@Controller('/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,

    @Inject('SAGA_CLIENT')
    private readonly sagaClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createOrderDto: ICreateOrderDto) {
    const order = await this.orderService.createOrder(createOrderDto);

    // Publish a message to the Saga Coordinator to initiate the local transaction
    const message = {
      type: 'ORDER_CREATED',
      payload: {
        orderId: order.id,
        customerId: createOrderDto.customerId,
        stockId: createOrderDto.stockId,
      },
    };
    this.sagaClient.emit('saga', message);

    return { order };
  }

  @MessagePattern('saga')
  async handleSagaMessage(@Payload() message, @Ctx() context) {
    const originalMessage = context.getMessage();
    switch (message.type) {
      case 'ORDER_CREATED':
        try {
          // Perform the local transaction
          await this.orderService.confirmOrder(message.payload.orderId);
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
          this.sagaClient.emit('saga', compensatingMessage);
          // Acknowledge the message
          context.getChannelRef().ack(originalMessage);
        }
        break;
      case 'ORDER_CONFIRMATION_FAILED':
        // Undo the effects of the failed local transaction
        await this.orderService.cancelOrder(message.payload.orderId);
        // Acknowledge the message
        context.getChannelRef().ack(originalMessage);
        break;
    }
  }
}
