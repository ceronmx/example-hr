import { Balance } from '../../domain/entities/balance';
import { TimeOffRequest } from '../../domain/entities/time-off-request';

export interface IHcmClient {
  getRemoteBalance(
    employeeId: string,
    locationId: string,
    leaveTypeId: string,
  ): Promise<Balance>;

  sendTimeOffRequest(request: TimeOffRequest): Promise<string>; // Returns hcmRefId

  getBatchBalances(): Promise<Balance[]>;
}
