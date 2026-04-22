import { TimeOffRequestStatus } from './time-off-request-status.enum';
import { canTransitionTo } from './time-off-request-transitions';
import { Balance } from './balance';

export class TimeOffRequest {
  id: string;
  employee_id: string;
  location_id: string;
  leave_type_id: string;
  days_requested: number;
  start_date: Date;
  end_date: Date;
  status: TimeOffRequestStatus;
  idempotency_key: string;
  hcm_ref_id: string | null;
  error_message: string | null;
  created_at: Date;
  balance?: Balance;

  constructor(props: Partial<TimeOffRequest>) {
    Object.assign(this, props);
  }

  transitionTo(nextStatus: TimeOffRequestStatus): void {
    if (!canTransitionTo(this.status, nextStatus)) {
      throw new Error(
        `Invalid status transition from ${this.status} to ${nextStatus}`,
      );
    }
    this.status = nextStatus;
  }
}
