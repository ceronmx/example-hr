import { IHcmClient } from '../../application/ports/hcm-client.interface';
import { Balance } from '../../domain/entities/balance';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HcmClientMock implements IHcmClient {
  getRemoteBalance(
    employeeId: string,
    locationId: string,
    leaveTypeId: string,
  ): Promise<Balance> {
    return Promise.resolve(
      new Balance({
        employeeId,
        locationId,
        leaveTypeId,
        currentBalance: 20,
        lastSyncedAt: new Date(),
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendTimeOffRequest(_request: TimeOffRequest): Promise<string> {
    return Promise.resolve('HCM-REF-123');
  }

  getBatchBalances(): Promise<Balance[]> {
    return Promise.resolve([
      new Balance({
        employeeId: 'EMP001',
        locationId: 'LOC001',
        leaveTypeId: 'VACATION',
        currentBalance: 20,
        lastSyncedAt: new Date(),
      }),
    ]);
  }
}
