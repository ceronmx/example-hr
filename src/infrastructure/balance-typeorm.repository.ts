import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../domain/entities/balance';
import { BalanceRepository } from '../application/balance.repository';
import { BalanceEntity } from './persistence/entities/balance.entity';
import { BalanceMapper } from './persistence/mappers/balance.mapper';

@Injectable()
export class BalanceTypeOrmRepository implements BalanceRepository {
  constructor(
    @InjectRepository(BalanceEntity)
    private readonly repository: Repository<BalanceEntity>,
  ) {}

  async findByKeys(
    employeeId: string,
    locationId: string,
    leaveTypeId: string,
  ): Promise<Balance | null> {
    const entity = await this.repository.findOneBy({
      employee_id: employeeId,
      location_id: locationId,
      leave_type_id: leaveTypeId,
    });

    return entity ? BalanceMapper.toDomain(entity) : null;
  }

  async findByEmployee(
    employeeId: string,
    locationId: string,
  ): Promise<Balance[]> {
    const entities = await this.repository.findBy({
      employee_id: employeeId,
      location_id: locationId,
    });

    return entities.map((e) => BalanceMapper.toDomain(e));
  }

  async save(balance: Balance): Promise<Balance> {
    const entity = BalanceMapper.toPersistence(balance);
    const saved = await this.repository.save(entity);
    return BalanceMapper.toDomain(saved);
  }
}
