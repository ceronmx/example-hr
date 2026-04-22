import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Balance } from './balance.entity';
import { TimeOffRequestStatus } from './time-off-request-status.enum';

@Entity('time_off_request')
export class TimeOffRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  employee_id: string;

  @Column('uuid')
  location_id: string;

  @Column('uuid')
  leave_type_id: string;

  @Column('datetime')
  start_date: Date;

  @Column('datetime')
  end_date: Date;

  @Column({
    type: 'simple-enum',
    enum: TimeOffRequestStatus,
    default: TimeOffRequestStatus.PENDING_APPROVAL,
  })
  status: TimeOffRequestStatus;

  @Column({ type: 'uuid', nullable: true, default: null })
  hcm_ref_id: string | null;

  @ManyToOne(() => Balance)
  @JoinColumn([
    { name: 'employee_id', referencedColumnName: 'employee_id' },
    { name: 'location_id', referencedColumnName: 'location_id' },
    { name: 'leave_type_id', referencedColumnName: 'leave_type_id' },
  ])
  balance: Balance;
}
