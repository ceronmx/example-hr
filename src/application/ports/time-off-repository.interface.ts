import { Balance } from '../../domain/entities/balance';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { HcmSyncLog } from '../../domain/entities/hcm-sync-log';

export interface ITimeOffRepository {
  findBalance(
    employeeId: string,
    locationId: string,
    leaveTypeId: string,
  ): Promise<Balance | null>;
  saveBalance(balance: Balance): Promise<void>;

  findRequestById(id: string): Promise<TimeOffRequest | null>;
  findPendingRequests(
    employeeId: string,
    locationId: string,
    leaveTypeId: string,
  ): Promise<TimeOffRequest[]>;
  saveRequest(request: TimeOffRequest): Promise<void>;

  saveSyncLog(log: HcmSyncLog): Promise<void>;
}
