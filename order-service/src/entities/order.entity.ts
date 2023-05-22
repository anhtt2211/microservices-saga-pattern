import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  customerId: number;

  @Column()
  @Index()
  stockId: number;

  @Column()
  orderDate: Date;

  @Column()
  totalAmount: number;

  @Column()
  status: string;
}
