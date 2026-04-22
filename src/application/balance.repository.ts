import { Balance } from '../domain/entities/balance';

export interface BalanceRepository {
  findByKeys(
    employeeId: string,
    locationId: string,
    leaveTypeId: string,
  ): Promise<Balance | null>;
  findByEmployee(employeeId: string, locationId: string): Promise<Balance[]>;
  save(balance: Balance): Promise<Balance>;
}

export const BALANCE_REPOSITORY = Symbol('BalanceRepository');
