import { TimeOffRequest } from './time-off-request';
import { TimeOffRequestStatus } from './time-off-request-status.enum';
import { canTransitionTo } from './time-off-request-transitions';

describe('TimeOffRequest Entity', () => {
  it('should be created with properties', () => {
    const request = new TimeOffRequest({
      id: 'req-1',
      employeeId: 'EMP001',
      idempotencyKey: 'key-1',
    });
    expect(request.id).toBe('req-1');
    expect(request.employeeId).toBe('EMP001');
    expect(request.idempotencyKey).toBe('key-1');
  });

  describe('Status Transitions', () => {
    let request: TimeOffRequest;

    beforeEach(() => {
      request = new TimeOffRequest({
        status: TimeOffRequestStatus.PENDING_APPROVAL,
      });
    });

    it('should transition from PENDING_APPROVAL to APPROVED', () => {
      request.transitionTo(TimeOffRequestStatus.APPROVED);
      expect(request.status).toBe(TimeOffRequestStatus.APPROVED);
    });

    it('should transition from PENDING_APPROVAL to REJECTED', () => {
      request.transitionTo(TimeOffRequestStatus.REJECTED);
      expect(request.status).toBe(TimeOffRequestStatus.REJECTED);
    });

    it('should transition from APPROVED to SYNCING', () => {
      request.status = TimeOffRequestStatus.APPROVED;
      request.transitionTo(TimeOffRequestStatus.SYNCING);
      expect(request.status).toBe(TimeOffRequestStatus.SYNCING);
    });

    it('should transition from APPROVED to CANCELLED', () => {
      request.status = TimeOffRequestStatus.APPROVED;
      request.transitionTo(TimeOffRequestStatus.CANCELLED);
      expect(request.status).toBe(TimeOffRequestStatus.CANCELLED);
    });

    it('should transition through APPROVED -> SYNCING -> SYNCED', () => {
      request.status = TimeOffRequestStatus.APPROVED;
      request.transitionTo(TimeOffRequestStatus.SYNCING);
      request.transitionTo(TimeOffRequestStatus.SYNCED);
      expect(request.status).toBe(TimeOffRequestStatus.SYNCED);
    });

    it('should transition through APPROVED -> SYNCING -> FAILED_SYNC', () => {
      request.status = TimeOffRequestStatus.APPROVED;
      request.transitionTo(TimeOffRequestStatus.SYNCING);
      request.transitionTo(TimeOffRequestStatus.FAILED_SYNC);
      expect(request.status).toBe(TimeOffRequestStatus.FAILED_SYNC);
    });

    it('should throw DomainException for invalid transition PENDING_APPROVAL -> SYNCED', () => {
      expect(() => {
        request.transitionTo(TimeOffRequestStatus.SYNCED);
      }).toThrow('Invalid status transition from PENDING_APPROVAL to SYNCED');
    });

    it('should throw DomainException for invalid transition SYNCED -> SYNCING', () => {
      request.status = TimeOffRequestStatus.SYNCED;
      expect(() => {
        request.transitionTo(TimeOffRequestStatus.SYNCING);
      }).toThrow('Invalid status transition from SYNCED to SYNCING');
    });
  });

  describe('canTransitionTo logic', () => {
    it('should return false for unknown current status', () => {
      // @ts-expect-error - testing invalid enum value
      expect(canTransitionTo('INVALID', TimeOffRequestStatus.APPROVED)).toBe(
        false,
      );
    });
  });
});
