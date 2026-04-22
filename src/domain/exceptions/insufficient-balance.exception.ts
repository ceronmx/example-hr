import { DomainException } from './domain.exception';

export class InsufficientBalanceException extends DomainException {
  constructor(employeeId: string, required: number, available: number) {
    super(
      `Employee ${employeeId} has insufficient balance. Required: ${required}, Available: ${available}`,
    );
    this.name = 'InsufficientBalanceException';
  }
}
