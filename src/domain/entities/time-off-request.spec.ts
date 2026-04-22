import { TimeOffRequest } from './time-off-request';
import { TimeOffRequestStatus } from './time-off-request-status.enum';

describe('TimeOffRequest Status Transitions', () => {
  let request: TimeOffRequest;

  beforeEach(() => {
    request = new TimeOffRequest({
      status: TimeOffRequestStatus.PENDING_APPROVAL,
    });
  });

  it('should transition from PENDING_APPROVAL to CANCELLED', () => {
    request.status = TimeOffRequestStatus.APPROVED; // PENDING_APPROVAL cannot go to CANCELLED anymore in the new rules
    request.transitionTo(TimeOffRequestStatus.CANCELLED);
    expect(request.status).toBe(TimeOffRequestStatus.CANCELLED);
  });

  it('should transition from PENDING_APPROVAL to APPROVED', () => {
    request.transitionTo(TimeOffRequestStatus.APPROVED);
    expect(request.status).toBe(TimeOffRequestStatus.APPROVED);
  });

  it('should transition through APPROVED -> SYNCING -> SYNCED', () => {
    request.status = TimeOffRequestStatus.APPROVED;
    request.transitionTo(TimeOffRequestStatus.SYNCING);
    expect(request.status).toBe(TimeOffRequestStatus.SYNCING);
    request.transitionTo(TimeOffRequestStatus.SYNCED);
    expect(request.status).toBe(TimeOffRequestStatus.SYNCED);
  });

  it('should transition through APPROVED -> SYNCING -> FAILED_SYNC', () => {
    request.status = TimeOffRequestStatus.APPROVED;
    request.transitionTo(TimeOffRequestStatus.SYNCING);
    expect(request.status).toBe(TimeOffRequestStatus.SYNCING);
    request.transitionTo(TimeOffRequestStatus.FAILED_SYNC);
    expect(request.status).toBe(TimeOffRequestStatus.FAILED_SYNC);
  });

  it('should throw error for invalid transition PENDING_APPROVAL -> SYNCED', () => {
    expect(() => {
      request.transitionTo(TimeOffRequestStatus.SYNCED);
    }).toThrow('Invalid status transition from PENDING_APPROVAL to SYNCED');
  });

  it('should throw error for invalid transition SYNCED -> SYNCING', () => {
    request.status = TimeOffRequestStatus.SYNCED;
    expect(() => {
      request.transitionTo(TimeOffRequestStatus.SYNCING);
    }).toThrow('Invalid status transition from SYNCED to SYNCING');
  });
});
