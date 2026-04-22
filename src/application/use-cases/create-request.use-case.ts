import { randomUUID } from 'crypto';
import { ITimeOffRepository } from '../ports/time-off-repository.interface';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { TimeOffRequestStatus } from '../../domain/entities/time-off-request-status.enum';
import { EntityNotFoundException } from '../../domain/exceptions/entity-not-found.exception';
import { InsufficientBalanceException } from '../../domain/exceptions/insufficient-balance.exception';
import { LeaveType } from '../../domain/entities/leave-type.enum';

export interface CreateRequestInput {
  employeeId: string;
  locationId: string;
  leaveTypeId: LeaveType;
  daysRequested: number;
  startDate: Date;
  endDate: Date;
}

export class CreateRequestUseCase {
  constructor(private readonly repository: ITimeOffRepository) {}

  async execute(input: CreateRequestInput): Promise<TimeOffRequest> {
    const { employeeId, locationId, leaveTypeId, daysRequested } = input;

    // 1. Fetch current local balance
    const balance = await this.repository.findBalance(
      employeeId,
      locationId,
      leaveTypeId,
    );

    if (!balance) {
      throw new EntityNotFoundException(
        'Balance',
        `${employeeId}-${locationId}-${leaveTypeId}`,
      );
    }

    // 2. Calculate "Available Balance" (Current - Sum of Pending)
    const pendingRequests = await this.repository.findPendingRequests(
      employeeId,
      locationId,
      leaveTypeId,
    );

    const pendingDays = pendingRequests.reduce(
      (sum, req) => sum + req.daysRequested,
      0,
    );

    const availableBalance = balance.currentBalance - pendingDays;

    // 3. Validate enough balance
    if (availableBalance < daysRequested) {
      throw new InsufficientBalanceException(
        employeeId,
        daysRequested,
        availableBalance,
      );
    }

    // 4. Create request in PENDING_APPROVAL state
    const request = new TimeOffRequest({
      id: randomUUID(),
      employeeId,
      locationId,
      leaveTypeId,
      daysRequested,
      startDate: input.startDate,
      endDate: input.endDate,
      status: TimeOffRequestStatus.PENDING_APPROVAL,
      idempotencyKey: randomUUID(),
      hcmRefId: null,
      errorMessage: null,
      createdAt: new Date(),
    });

    // 5. Persist via repository
    await this.repository.saveRequest(request);

    return request;
  }
}
