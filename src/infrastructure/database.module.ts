import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceEntity } from './persistence/entities/balance.entity';
import { TimeOffRequestEntity } from './persistence/entities/time-off-request.entity';
import {
  HcmSyncLogEntity,
  SyncBatchItemEntity,
} from './persistence/entities/hcm-sync-log.entity';
import { BalanceTypeOrmRepository } from './balance-typeorm.repository';
import { BALANCE_REPOSITORY } from '../application/balance.repository';
import { TimeOffRequestTypeOrmRepository } from './time-off-request-typeorm.repository';
import { TIME_OFF_REQUEST_REPOSITORY } from '../application/time-off-request.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [
        BalanceEntity,
        TimeOffRequestEntity,
        HcmSyncLogEntity,
        SyncBatchItemEntity,
      ],
      synchronize: true, // Only for development
    }),
    TypeOrmModule.forFeature([
      BalanceEntity,
      TimeOffRequestEntity,
      HcmSyncLogEntity,
      SyncBatchItemEntity,
    ]),
  ],
  providers: [
    {
      provide: BALANCE_REPOSITORY,
      useClass: BalanceTypeOrmRepository,
    },
    {
      provide: TIME_OFF_REQUEST_REPOSITORY,
      useClass: TimeOffRequestTypeOrmRepository,
    },
  ],
  exports: [BALANCE_REPOSITORY, TIME_OFF_REQUEST_REPOSITORY],
})
export class DatabaseModule {}
