import {
  CreateProductCommandHandler,
  DeleteProductCommandHandler,
  ReserveStockCommandHandler,
  UpdateInventoryCommandHandler,
  UpdateProductCommandHandler,
} from '../commands/handlers';

export * from './handlers';
export * from './impl';

export const CommandHandlers = [
  CreateProductCommandHandler,
  UpdateProductCommandHandler,
  DeleteProductCommandHandler,
  ReserveStockCommandHandler,
  UpdateInventoryCommandHandler,
];
