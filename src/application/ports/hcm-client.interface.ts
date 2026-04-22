import { Balance } from '../../domain/entities/balance';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { LeaveType } from '../../domain/entities/leave-type.enum';

export interface IHcmClient {
  getRemoteBalance(
    employeeId: string,
    locationId: string,
    leaveTypeId: LeaveType,
  ): Promise<Balance>;

  sendTimeOffRequest(request: TimeOffRequest): Promise<string>; // Returns hcmRefId

  getBatchBalances(): Promise<Balance[]>;
}
