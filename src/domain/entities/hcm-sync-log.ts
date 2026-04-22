export enum SyncType {
  REAL_TIME = 'REAL_TIME',
  BATCH = 'BATCH',
}

export enum SyncStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
}

export class HcmSyncLog {
  id!: string;
  syncType!: SyncType;
  status!: SyncStatus;
  startedAt!: Date;
  finishedAt!: Date | null;
  lastProcessedId!: string | null;
  payloadDump!: string;

  constructor(props: Partial<HcmSyncLog>) {
    Object.assign(this, props);
  }
}
