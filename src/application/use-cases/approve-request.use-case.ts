import { ITimeOffRepository } from '../ports/time-off-repository.interface';
import { IHcmClient } from '../ports/hcm-client.interface';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { TimeOffRequestStatus } from '../../domain/entities/time-off-request-status.enum';
import { EntityNotFoundException } from '../../domain/exceptions/entity-not-found.exception';

export interface ApproveRequestInput {
  requestId: string;
  managerId: string;
}

export class ApproveRequestUseCase {
  constructor(
    private readonly repository: ITimeOffRepository,
    private readonly hcmClient: IHcmClient,
  ) {}

  async execute(input: ApproveRequestInput): Promise<TimeOffRequest> {
    const { requestId } = input;

    const request = await this.repository.findRequestById(requestId);

    if (!request) {
      throw new EntityNotFoundException('TimeOffRequest', requestId);
    }

    // 1. Domain Transition to APPROVED
    request.transitionTo(TimeOffRequestStatus.APPROVED);
    await this.repository.saveRequest(request);

    // 2. Trigger Sync
    request.transitionTo(TimeOffRequestStatus.SYNCING);
    await this.repository.saveRequest(request);

    try {
      const hcmRefId = await this.hcmClient.sendTimeOffRequest(request);

      request.hcmRefId = hcmRefId;
      request.transitionTo(TimeOffRequestStatus.SYNCED);
      request.errorMessage = null;
    } catch (error) {
      request.transitionTo(TimeOffRequestStatus.FAILED_SYNC);
      request.errorMessage =
        error instanceof Error ? error.message : 'HCM Sync Failed';
    }

    await this.repository.saveRequest(request);

    return request;
  }
}
