import { BalanceMapper } from './balance.mapper';
import { HcmSyncLogMapper } from './hcm-sync-log.mapper';
import { TimeOffRequestMapper } from './time-off-request.mapper';
import { Balance } from '../../../domain/entities/balance';
import { LeaveType } from '../../../domain/entities/leave-type.enum';
import {
  HcmSyncLog,
  SyncType,
  SyncStatus,
} from '../../../domain/entities/hcm-sync-log';
import { TimeOffRequest } from '../../../domain/entities/time-off-request';
import { TimeOffRequestStatus } from '../../../domain/entities/time-off-request-status.enum';
import { TimeOffStatus } from '../entities/time-off-request.entity';

describe('Persistence Mappers', () => {
  describe('BalanceMapper', () => {
    it('should map between Domain and Persistence', () => {
      const domain = new Balance({
        employeeId: 'E1',
        locationId: 'L1',
        leaveTypeId: LeaveType.VACATION,
        currentBalance: 10,
        lastSyncedAt: new Date(),
      });

      const entity = BalanceMapper.toPersistence(domain);
      expect(entity.employee_id).toBe('E1');
      expect(Number(entity.current_balance)).toBe(10);

      const backToDomain = BalanceMapper.toDomain(entity);
      expect(backToDomain.employeeId).toBe('E1');
      expect(backToDomain.currentBalance).toBe(10);
    });
  });

  describe('HcmSyncLogMapper', () => {
    it('should map between Domain and Persistence', () => {
      const domain = new HcmSyncLog({
        id: 'S1',
        syncType: SyncType.BATCH,
        status: SyncStatus.SUCCESS,
        startedAt: new Date(),
        finishedAt: new Date(),
        lastProcessedId: 'L1',
        payloadDump: '{}',
      });

      const entity = HcmSyncLogMapper.toPersistence(domain);
      expect(entity.id).toBe('S1');
      expect(entity.sync_type).toBe(SyncType.BATCH);

      const backToDomain = HcmSyncLogMapper.toDomain(entity);
      expect(backToDomain.id).toBe('S1');
      expect(backToDomain.syncType).toBe(SyncType.BATCH);
    });
  });

  describe('TimeOffRequestMapper', () => {
    it('should map between Domain and Persistence', () => {
      const domain = new TimeOffRequest({
        id: 'R1',
        employeeId: 'E1',
        locationId: 'L1',
        leaveTypeId: LeaveType.VACATION,
        daysRequested: 5,
        startDate: new Date(),
        endDate: new Date(),
        status: TimeOffRequestStatus.PENDING_APPROVAL,
        idempotencyKey: 'K1',
        hcmRefId: null,
        errorMessage: null,
      });

      const entity = TimeOffRequestMapper.toPersistence(domain);
      expect(entity.id).toBe('R1');
      expect(entity.status).toBe(TimeOffStatus.PENDING_APPROVAL);

      const backToDomain = TimeOffRequestMapper.toDomain(entity);
      expect(backToDomain.id).toBe('R1');
      expect(backToDomain.status).toBe(TimeOffRequestStatus.PENDING_APPROVAL);
    });
  });
});
