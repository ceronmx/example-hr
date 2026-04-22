import { Balance } from '../../domain/entities/balance';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { HcmSyncLog } from '../../domain/entities/hcm-sync-log';
import { LeaveType } from '../../domain/entities/leave-type.enum';
import { TimeOffRequestStatus } from '../../domain/entities/time-off-request-status.enum';

export interface ITimeOffRepository {
  findBalance(
    employeeId: string,
    locationId: string,
    leaveTypeId: LeaveType,
  ): Promise<Balance | null>;
  findAllBalancesByEmployee(
    employeeId: string,
    locationId: string,
  ): Promise<Balance[]>;
  saveBalance(balance: Balance): Promise<void>;

  findRequestById(id: string): Promise<TimeOffRequest | null>;
  findPendingRequests(
    employeeId: string,
    locationId: string,
    leaveTypeId: LeaveType,
  ): Promise<TimeOffRequest[]>;
  findActiveRequestsByEmployee(
    employeeId: string,
    locationId: string,
    statuses: TimeOffRequestStatus[],
  ): Promise<TimeOffRequest[]>;
  saveRequest(request: TimeOffRequest): Promise<void>;

  saveSyncLog(log: HcmSyncLog): Promise<void>;

  findPending(locationId?: string): Promise<TimeOffRequest[]>;
  findPendingByLocation(locationId: string): Promise<TimeOffRequest[]>;
}
