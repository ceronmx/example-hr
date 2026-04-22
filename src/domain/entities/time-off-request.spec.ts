import { TimeOffRequest } from './time-off-request';
import { TimeOffRequestStatus } from './time-off-request-status.enum';

describe('TimeOffRequest Status Transitions', () => {
  let request: TimeOffRequest;

  beforeEach(() => {
    request = new TimeOffRequest({
      status: TimeOffRequestStatus.PENDING,
    });
  });

  it('should transition from PENDING to CANCELLED', () => {
    request.transitionTo(TimeOffRequestStatus.CANCELLED);
    expect(request.status).toBe(TimeOffRequestStatus.CANCELLED);
  });

  it('should transition from PENDING to APPROVED', () => {
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

  it('should transition through APPROVED -> SYNCING -> FAILED', () => {
    request.status = TimeOffRequestStatus.APPROVED;
    request.transitionTo(TimeOffRequestStatus.SYNCING);
    expect(request.status).toBe(TimeOffRequestStatus.SYNCING);
    request.transitionTo(TimeOffRequestStatus.FAILED);
    expect(request.status).toBe(TimeOffRequestStatus.FAILED);
  });

  it('should throw error for invalid transition PENDING -> SYNCED', () => {
    expect(() => {
      request.transitionTo(TimeOffRequestStatus.SYNCED);
    }).toThrow('Invalid status transition from PENDING to SYNCED');
  });

  it('should throw error for invalid transition SYNCED -> SYNCING', () => {
    request.status = TimeOffRequestStatus.SYNCED;
    expect(() => {
      request.transitionTo(TimeOffRequestStatus.SYNCING);
    }).toThrow('Invalid status transition from SYNCED to SYNCING');
  });
});
