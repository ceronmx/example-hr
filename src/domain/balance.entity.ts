import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('balance')
export class Balance {
  @PrimaryColumn('uuid')
  employee_id: string;

  @PrimaryColumn('uuid')
  location_id: string;

  @PrimaryColumn('uuid')
  leave_type_id: string;

  @Column('smallint')
  current_balance: number;

  @Column('datetime')
  last_synced_at: Date;
}
