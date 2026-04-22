import { TimeOffRequest } from './time-off-request.entity';
import { TimeOffRequestStatus } from './time-off-request-status.enum';

describe('TimeOffRequest Status Transitions', () => {
  let request: TimeOffRequest;

  beforeEach(() => {
    request = new TimeOffRequest();
    request.status = TimeOffRequestStatus.PENDING_APPROVAL;
  });

  it('should transition from PENDING_APPROVAL to REJECTED', () => {
    request.transitionTo(TimeOffRequestStatus.REJECTED);
    expect(request.status).toBe(TimeOffRequestStatus.REJECTED);
  });

  it('should transition from PENDING_APPROVAL to CANCELLED', () => {
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

  it('should throw error for invalid transition REJECTED -> APPROVED', () => {
    request.status = TimeOffRequestStatus.REJECTED;
    expect(() => {
      request.transitionTo(TimeOffRequestStatus.APPROVED);
    }).toThrow('Invalid status transition from REJECTED to APPROVED');
  });

  it('should throw error for invalid transition SYNCED -> SYNCING', () => {
    request.status = TimeOffRequestStatus.SYNCED;
    expect(() => {
      request.transitionTo(TimeOffRequestStatus.SYNCING);
    }).toThrow('Invalid status transition from SYNCED to SYNCING');
  });
});
