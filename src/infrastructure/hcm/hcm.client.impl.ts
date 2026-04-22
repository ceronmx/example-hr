import { IHcmClient } from '../../application/ports/hcm-client.interface';
import { Balance } from '../../domain/entities/balance';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { Injectable } from '@nestjs/common';
import { LeaveType } from '../../domain/entities/leave-type.enum';

@Injectable()
export class HcmClientImpl implements IHcmClient {
  private readonly baseUrl =
    process.env.HCM_BASE_URL || 'http://localhost:3001';

  async getRemoteBalance(
    employeeId: string,
    locationId: string,
    leaveTypeId: LeaveType,
  ): Promise<Balance> {
    const response = await fetch(
      `${this.baseUrl}/balances/${employeeId}/${locationId}`,
    );
    if (!response.ok) {
      throw new Error(`HCM Error: ${response.statusText}`);
    }
    const data = (await response.json()) as { balance: number };

    return new Balance({
      employeeId,
      locationId,
      leaveTypeId,
      currentBalance: data.balance,
      lastSyncedAt: new Date(),
    });
  }

  async sendTimeOffRequest(request: TimeOffRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/time-off`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': request.idempotencyKey,
      },
      body: JSON.stringify({
        employeeId: request.employeeId,
        locationId: request.locationId,
        daysRequested: request.daysRequested,
      }),
    });

    if (!response.ok) {
      throw new Error(`HCM Error: ${response.statusText}`);
    }

    const data = (await response.json()) as { hcm_ref_id: string };
    return data.hcm_ref_id;
  }

  async getBatchBalances(): Promise<Balance[]> {
    // In a real implementation, this might call a different endpoint
    return await Promise.resolve([]);
  }
}
