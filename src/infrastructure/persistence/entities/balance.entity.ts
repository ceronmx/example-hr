import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('balances')
export class BalanceEntity {
  @PrimaryColumn()
  employee_id!: string;

  @PrimaryColumn()
  location_id!: string;

  @PrimaryColumn()
  leave_type_id!: string; // Stored as string in SQLite

  @Column('decimal', { precision: 10, scale: 2 })
  current_balance!: number;

  @Column('datetime')
  last_synced_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
