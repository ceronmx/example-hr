import { Balance } from './balance';
import { LeaveType } from './leave-type.enum';

describe('Balance Entity', () => {
  it('should be created with properties', () => {
    const now = new Date();
    const balance = new Balance({
      employeeId: 'EMP001',
      locationId: 'LOC001',
      leaveTypeId: LeaveType.VACATION,
      currentBalance: 20,
      lastSyncedAt: now,
    });

    expect(balance.employeeId).toBe('EMP001');
    expect(balance.currentBalance).toBe(20);
    expect(balance.lastSyncedAt).toBe(now);
  });

  describe('canCover', () => {
    const balance = new Balance({ currentBalance: 10 });

    it('should return true if current balance is greater than requested days', () => {
      expect(balance.canCover(5)).toBe(true);
    });

    it('should return true if current balance is equal to requested days', () => {
      expect(balance.canCover(10)).toBe(true);
    });

    it('should return false if current balance is less than requested days', () => {
      expect(balance.canCover(11)).toBe(false);
    });

    it('should return true if requested days is zero', () => {
      expect(balance.canCover(0)).toBe(true);
    });

    it('should return true if requested days is negative', () => {
      expect(balance.canCover(-1)).toBe(true);
    });
  });
});
