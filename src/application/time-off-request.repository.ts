import { TimeOffRequest } from '../domain/entities/time-off-request';
import { TimeOffRequestStatus } from '../domain/entities/time-off-request-status.enum';

export interface TimeOffRequestRepository {
  findAll(): Promise<TimeOffRequest[]>;
  findById(id: string): Promise<TimeOffRequest | null>;
  findActiveByEmployee(
    employeeId: string,
    locationId: string,
    statuses: TimeOffRequestStatus[],
  ): Promise<TimeOffRequest[]>;
  save(timeOffRequest: TimeOffRequest): Promise<TimeOffRequest>;
  delete(id: string): Promise<void>;
}

export const TIME_OFF_REQUEST_REPOSITORY = Symbol('TimeOffRequestRepository');
