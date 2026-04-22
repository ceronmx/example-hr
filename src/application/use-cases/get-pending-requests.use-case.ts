import { ITimeOffRepository } from '../ports/time-off-repository.interface';
import { TimeOffRequest } from '../../domain/entities/time-off-request';

export interface GetPendingRequestsInput {
  managerId: string;
  locationId?: string;
}

export class GetPendingRequestsUseCase {
  constructor(private readonly repository: ITimeOffRepository) {}

  async execute(input: GetPendingRequestsInput): Promise<TimeOffRequest[]> {
    return await this.repository.findPending(input.locationId);
  }
}
