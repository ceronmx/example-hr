import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { EntityNotFoundException } from '../../domain/exceptions/entity-not-found.exception';
import { InsufficientBalanceException } from '../../domain/exceptions/insufficient-balance.exception';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { Response } from 'express';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue({ url: '/test' }),
    } as unknown as ArgumentsHost;
  });

  it('should map EntityNotFoundException to 404', () => {
    const exception = new EntityNotFoundException('TestEntity', '123');
    filter.catch(exception, mockArgumentsHost as ArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should map InsufficientBalanceException to 422', () => {
    const exception = new InsufficientBalanceException('EMP-1', 10, 5);
    filter.catch(exception, mockArgumentsHost as ArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  });

  it('should map generic DomainException to 400', () => {
    const exception = new DomainException('Generic Error');
    filter.catch(exception, mockArgumentsHost as ArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });
});
