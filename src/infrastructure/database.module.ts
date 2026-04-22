import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Balance } from '../domain/balance.entity';
import { BalanceTypeOrmRepository } from './balance-typeorm.repository';
import { BALANCE_REPOSITORY } from '../application/balance.repository';
import { TimeOffRequest } from '../domain/time-off-request.entity';
import { TimeOffRequestTypeOrmRepository } from './time-off-request-typeorm.repository';
import { TIME_OFF_REQUEST_REPOSITORY } from '../application/time-off-request.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Balance, TimeOffRequest],
      synchronize: true, // Only for development
    }),
    TypeOrmModule.forFeature([Balance, TimeOffRequest]),
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
