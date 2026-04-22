import { HcmSyncLog } from '../../../domain/entities/hcm-sync-log';
import { HcmSyncLogEntity } from '../entities/hcm-sync-log.entity';

export class HcmSyncLogMapper {
  static toDomain(entity: HcmSyncLogEntity): HcmSyncLog {
    return new HcmSyncLog({
      id: entity.id,
      syncType: entity.sync_type,
      status: entity.status,
      startedAt: entity.started_at,
      finishedAt: entity.finished_at,
      lastProcessedId: entity.last_processed_id,
      payloadDump: entity.payload_dump,
    });
  }

  static toPersistence(domain: HcmSyncLog): HcmSyncLogEntity {
    const entity = new HcmSyncLogEntity();
    entity.id = domain.id;
    entity.sync_type = domain.syncType;
    entity.status = domain.status;
    entity.started_at = domain.startedAt;
    entity.finished_at = domain.finishedAt;
    entity.last_processed_id = domain.lastProcessedId;
    entity.payload_dump = domain.payloadDump;
    return entity;
  }
}
