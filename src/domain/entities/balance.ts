export class Balance {
  employee_id!: string;
  location_id!: string;
  leave_type_id!: string;
  current_balance!: number;
  last_synced_at!: Date;
  updated_at?: Date;

  constructor(props: Partial<Balance>) {
    Object.assign(this, props);
  }
}
