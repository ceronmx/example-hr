import { DomainException } from './domain.exception';
import { EntityNotFoundException } from './entity-not-found.exception';
import { InsufficientBalanceException } from './insufficient-balance.exception';

describe('Domain Exceptions', () => {
  it('DomainException should have correct properties', () => {
    const error = new DomainException('test message');
    expect(error.message).toBe('test message');
    expect(error.name).toBe('DomainException');
  });

  it('EntityNotFoundException should have correct properties', () => {
    const error = new EntityNotFoundException('User', '123');
    expect(error.message).toBe('User with ID 123 not found');
    expect(error.name).toBe('EntityNotFoundException');
    expect(error instanceof DomainException).toBe(true);
  });

  it('InsufficientBalanceException should have correct properties', () => {
    const error = new InsufficientBalanceException('EMP001', 10, 5);
    expect(error.message).toBe(
      'Employee EMP001 has insufficient balance. Required: 10, Available: 5',
    );
    expect(error.name).toBe('InsufficientBalanceException');
    expect(error instanceof DomainException).toBe(true);
  });
});
