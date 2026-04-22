import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BalanceEntity } from './balance.entity';

export enum TimeOffStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  FAILED_SYNC = 'FAILED_SYNC',
  CANCELLED = 'CANCELLED',
}

@Entity('time_off_requests')
export class TimeOffRequestEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_tor_employee')
  @Column()
  employee_id!: string;

  @Index('idx_tor_location')
  @Column()
  location_id!: string;

  @Column()
  leave_type_id!: string; // Stored as string in SQLite

  @Column('decimal', { precision: 10, scale: 2 })
  days_requested!: number;

  @Column('date')
  start_date!: Date;

  @Column('date')
  end_date!: Date;

  @Column({
    type: 'simple-enum',
    enum: TimeOffStatus,
  })
  status!: TimeOffStatus;

  @Column({ unique: true })
  idempotency_key!: string;

  @Column({ nullable: true })
  hcm_ref_id!: string;

  @Column({ type: 'text', nullable: true })
  error_message!: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => BalanceEntity)
  @JoinColumn([
    { name: 'employee_id', referencedColumnName: 'employee_id' },
    { name: 'location_id', referencedColumnName: 'location_id' },
    { name: 'leave_type_id', referencedColumnName: 'leave_type_id' },
  ])
  balance!: BalanceEntity;
}
