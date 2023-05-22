import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column({ default: 0 })
  balance: number;
}
