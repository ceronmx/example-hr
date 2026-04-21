import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../domain/balance.entity';
import { BalanceRepository } from '../application/balance.repository';

@Injectable()
export class BalanceTypeOrmRepository implements BalanceRepository {
  constructor(
    @InjectRepository(Balance)
    private readonly repository: Repository<Balance>,
  ) {}

  findByKeys(
    employeeId: string,
    locationId: string,
    leaveTypeId: string,
  ): Promise<Balance | null> {
    return this.repository.findOneBy({
      employee_id: employeeId,
      location_id: locationId,
      leave_type_id: leaveTypeId,
    });
  }

  save(balance: Balance): Promise<Balance> {
    return this.repository.save(balance);
  }
}
