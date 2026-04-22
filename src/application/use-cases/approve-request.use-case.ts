import { ITimeOffRepository } from '../ports/time-off-repository.interface';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { TimeOffRequestStatus } from '../../domain/entities/time-off-request-status.enum';
import { EntityNotFoundException } from '../../domain/exceptions/entity-not-found.exception';

export interface ApproveRequestInput {
  requestId: string;
  managerId: string;
}

export class ApproveRequestUseCase {
  constructor(private readonly repository: ITimeOffRepository) {}

  async execute(input: ApproveRequestInput): Promise<TimeOffRequest> {
    const { requestId } = input;

    const request = await this.repository.findRequestById(requestId);

    if (!request) {
      throw new EntityNotFoundException('TimeOffRequest', requestId);
    }

    // managerId validation could go here if we had manager entities

    request.transitionTo(TimeOffRequestStatus.APPROVED);

    await this.repository.saveRequest(request);

    return request;
  }
}
