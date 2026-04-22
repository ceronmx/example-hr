import { TimeOffRequestStatus } from './time-off-request-status.enum';
import { canTransitionTo } from './time-off-request-transitions';
import { Balance } from './balance';
import { DomainException } from '../exceptions/domain.exception';

export class TimeOffRequest {
  id!: string;
  employeeId!: string;
  locationId!: string;
  leaveTypeId!: string;
  daysRequested!: number;
  startDate!: Date;
  endDate!: Date;
  status!: TimeOffRequestStatus;
  idempotencyKey!: string;
  hcmRefId!: string | null;
  errorMessage!: string | null;
  createdAt!: Date;
  balance?: Balance;

  constructor(props: Partial<TimeOffRequest>) {
    Object.assign(this, props);
  }

  transitionTo(nextStatus: TimeOffRequestStatus): void {
    if (!canTransitionTo(this.status, nextStatus)) {
      throw new DomainException(
        `Invalid status transition from ${this.status} to ${nextStatus}`,
      );
    }
    this.status = nextStatus;
  }
}
