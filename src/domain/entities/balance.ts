import { LeaveType } from './leave-type.enum';

export class Balance {
  employeeId!: string;
  locationId!: string;
  leaveTypeId!: LeaveType;
  currentBalance!: number;
  lastSyncedAt!: Date;
  updatedAt?: Date;

  constructor(props: Partial<Balance>) {
    Object.assign(this, props);
  }

  canCover(days: number): boolean {
    return this.currentBalance >= days;
  }
}
