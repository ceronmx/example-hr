import { HcmSyncLog, SyncType, SyncStatus } from './hcm-sync-log';

describe('HcmSyncLog Entity', () => {
  it('should be created with properties', () => {
    const now = new Date();
    const log = new HcmSyncLog({
      id: 'log-1',
      syncType: SyncType.BATCH,
      status: SyncStatus.SUCCESS,
      startedAt: now,
      finishedAt: now,
      payloadDump: '{}',
    });

    expect(log.id).toBe('log-1');
    expect(log.syncType).toBe(SyncType.BATCH);
    expect(log.status).toBe(SyncStatus.SUCCESS);
    expect(log.startedAt).toBe(now);
    expect(log.finishedAt).toBe(now);
    expect(log.payloadDump).toBe('{}');
  });
});
