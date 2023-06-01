export class ProcessPaymentCommand {
  constructor(
    public readonly customerId: number,
    public readonly totalAmount: number,
  ) {}
}
