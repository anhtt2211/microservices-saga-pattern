import {
  CompensateProcessPaymentCommandHandler,
  CreateCustomerCommandHandler,
  ProcessPaymentCommandHandler,
} from '../commands/handlers';

export * from './handlers';
export * from './impl';

export const CommandHandlers = [
  CreateCustomerCommandHandler,
  ProcessPaymentCommandHandler,
  CompensateProcessPaymentCommandHandler,
];
