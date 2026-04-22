import { TimeOffRequestStatus } from './time-off-request-status.enum';

export const ALLOWED_TRANSITIONS: Record<
  TimeOffRequestStatus,
  TimeOffRequestStatus[]
> = {
  [TimeOffRequestStatus.PENDING]: [
    TimeOffRequestStatus.APPROVED,
    TimeOffRequestStatus.CANCELLED,
  ],
  [TimeOffRequestStatus.APPROVED]: [TimeOffRequestStatus.SYNCING],
  [TimeOffRequestStatus.SYNCING]: [
    TimeOffRequestStatus.SYNCED,
    TimeOffRequestStatus.FAILED,
  ],
  [TimeOffRequestStatus.SYNCED]: [],
  [TimeOffRequestStatus.FAILED]: [],
  [TimeOffRequestStatus.CANCELLED]: [],
};

export function canTransitionTo(
  currentStatus: TimeOffRequestStatus,
  nextStatus: TimeOffRequestStatus,
): boolean {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed?.includes(nextStatus) ?? false;
}
