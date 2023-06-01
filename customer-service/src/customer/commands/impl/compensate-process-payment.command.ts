export class CompensateProcessPaymentCommand {
  constructor(
    public readonly customerId: number,
    public readonly totalAmount: number,
  ) {}
}
