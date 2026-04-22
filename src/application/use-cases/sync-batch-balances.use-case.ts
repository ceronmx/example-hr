import { randomUUID } from 'crypto';
import { ITimeOffRepository } from '../ports/time-off-repository.interface';
import { IHcmClient } from '../ports/hcm-client.interface';
import {
  HcmSyncLog,
  SyncType,
  SyncStatus,
} from '../../domain/entities/hcm-sync-log';

export class SyncBatchBalancesUseCase {
  constructor(
    private readonly repository: ITimeOffRepository,
    private readonly hcmClient: IHcmClient,
  ) {}

  async execute(): Promise<void> {
    const startedAt = new Date();
    const log = new HcmSyncLog({
      id: randomUUID(),
      syncType: SyncType.BATCH,
      status: SyncStatus.SUCCESS,
      startedAt,
      finishedAt: null,
      lastProcessedId: null,
      payloadDump: '',
    });

    try {
      // 1. Fetch all balances from IHcmClient
      const remoteBalances = await this.hcmClient.getBatchBalances();
      log.payloadDump = JSON.stringify(remoteBalances);

      // 2. Update local balances table (Upsert)
      for (const balance of remoteBalances) {
        await this.repository.saveBalance(balance);
        log.lastProcessedId = `${balance.employeeId}-${balance.locationId}-${balance.leaveTypeId}`;
      }

      log.status = SyncStatus.SUCCESS;
    } catch (error) {
      log.status = SyncStatus.FAILURE;
      log.payloadDump = JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    } finally {
      log.finishedAt = new Date();
      // 3. Log the operation
      await this.repository.saveSyncLog(log);
    }
  }
}
