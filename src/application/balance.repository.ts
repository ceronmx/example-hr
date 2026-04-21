import { Balance } from '../domain/balance.entity';

export interface BalanceRepository {
  findByKeys(
    employeeId: string,
    locationId: string,
    leaveTypeId: string,
  ): Promise<Balance | null>;
  save(balance: Balance): Promise<Balance>;
}

export const BALANCE_REPOSITORY = Symbol('BalanceRepository');
