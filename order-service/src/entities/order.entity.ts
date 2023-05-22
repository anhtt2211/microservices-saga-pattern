import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;
}
