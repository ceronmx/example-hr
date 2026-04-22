import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { CreateRequestUseCase } from '../application/use-cases/create-request.use-case';
import { ApproveRequestUseCase } from '../application/use-cases/approve-request.use-case';
import { SyncBatchBalancesUseCase } from '../application/use-cases/sync-batch-balances.use-case';
import { TimeOffController } from './controllers/time-off.controller';
import { SyncController } from './controllers/sync.controller';
import { BALANCE_REPOSITORY } from '../application/balance.repository';
import { TIME_OFF_REQUEST_REPOSITORY } from '../application/time-off-request.repository';
import { ITimeOffRepository } from '../application/ports/time-off-repository.interface';
import { IHcmClient } from '../application/ports/hcm-client.interface';
import { HcmClientMock } from './hcm/hcm.client.mock';

const HCM_CLIENT = Symbol('IHcmClient');

@Module({
  imports: [DatabaseModule],
  controllers: [TimeOffController, SyncController],
  providers: [
    {
      provide: HCM_CLIENT,
      useClass: HcmClientMock,
    },
    {
      provide: CreateRequestUseCase,
      inject: [BALANCE_REPOSITORY],
      useFactory: (repo: ITimeOffRepository) => new CreateRequestUseCase(repo),
    },
    {
      provide: ApproveRequestUseCase,
      inject: [TIME_OFF_REQUEST_REPOSITORY],
      useFactory: (repo: ITimeOffRepository) => new ApproveRequestUseCase(repo),
    },
    {
      provide: SyncBatchBalancesUseCase,
      inject: [BALANCE_REPOSITORY, HCM_CLIENT],
      useFactory: (repo: ITimeOffRepository, hcm: IHcmClient) =>
        new SyncBatchBalancesUseCase(repo, hcm),
    },
  ],
})
export class TimeOffModule {}
