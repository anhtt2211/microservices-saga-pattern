import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ default: 0 })
  balance: number;
}
