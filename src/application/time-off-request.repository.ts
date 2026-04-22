import { TimeOffRequest } from '../domain/time-off-request.entity';

export interface TimeOffRequestRepository {
  findAll(): Promise<TimeOffRequest[]>;
  findById(id: string): Promise<TimeOffRequest | null>;
  save(timeOffRequest: TimeOffRequest): Promise<TimeOffRequest>;
  delete(id: string): Promise<void>;
}

export const TIME_OFF_REQUEST_REPOSITORY = Symbol('TimeOffRequestRepository');
