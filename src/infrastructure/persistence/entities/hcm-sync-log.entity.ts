import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum SyncType {
  REAL_TIME = 'REAL_TIME',
  BATCH = 'BATCH',
}

export enum SyncStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
}

@Entity('hcm_sync_logs')
export class HcmSyncLogEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({
    type: 'simple-enum',
    enum: SyncType,
  })
  sync_type!: SyncType;

  @Column({
    type: 'simple-enum',
    enum: SyncStatus,
  })
  status!: SyncStatus;

  @Column('datetime')
  started_at!: Date;

  @Column('datetime', { nullable: true })
  finished_at!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  last_processed_id!: string | null;

  @Column('text')
  payload_dump!: string; // Store as JSON string

  @OneToMany(() => SyncBatchItemEntity, (item) => item.sync_log)
  items!: SyncBatchItemEntity[];
}

export enum BatchItemStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('sync_batch_items')
export class SyncBatchItemEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  sync_log_id!: string;

  @Column()
  employee_id!: string;

  @Column({
    type: 'simple-enum',
    enum: BatchItemStatus,
  })
  status!: BatchItemStatus;

  @Column('text', { nullable: true })
  error_details!: string | null;

  @ManyToOne(() => HcmSyncLogEntity, (log) => log.items)
  @JoinColumn({ name: 'sync_log_id' })
  sync_log!: HcmSyncLogEntity;
}
