import {
  FindAllProductsQueryHandler,
  FindOneProductQueryHandler,
} from './handlers';

export * from './handlers';
export * from './impl';

export const QueryHandlers = [
  FindOneProductQueryHandler,
  FindAllProductsQueryHandler,
];
