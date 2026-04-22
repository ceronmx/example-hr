export class Balance {
  employeeId!: string;
  locationId!: string;
  leaveTypeId!: string;
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
