import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TimeOffRequest } from '../domain/entities/time-off-request';
import { TimeOffRequestRepository } from '../application/time-off-request.repository';
import {
  TimeOffRequestEntity,
  TimeOffStatus,
} from './persistence/entities/time-off-request.entity';
import { TimeOffRequestMapper } from './persistence/mappers/time-off-request.mapper';
import { TimeOffRequestStatus } from '../domain/entities/time-off-request-status.enum';

@Injectable()
export class TimeOffRequestTypeOrmRepository implements TimeOffRequestRepository {
  constructor(
    @InjectRepository(TimeOffRequestEntity)
    private readonly repository: Repository<TimeOffRequestEntity>,
  ) {}

  async findAll(): Promise<TimeOffRequest[]> {
    const entities = await this.repository.find({ relations: ['balance'] });
    return entities.map((e) => TimeOffRequestMapper.toDomain(e));
  }

  async findById(id: string): Promise<TimeOffRequest | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['balance'],
    });
    return entity ? TimeOffRequestMapper.toDomain(entity) : null;
  }

  async findActiveByEmployee(
    employeeId: string,
    locationId: string,
    statuses: TimeOffRequestStatus[],
  ): Promise<TimeOffRequest[]> {
    const entities = await this.repository.find({
      where: {
        employee_id: employeeId,
        location_id: locationId,
        status: In(statuses as unknown as TimeOffStatus[]),
      },
      relations: ['balance'],
    });

    return entities.map((e) => TimeOffRequestMapper.toDomain(e));
  }

  async save(timeOffRequest: TimeOffRequest): Promise<TimeOffRequest> {
    const entity = TimeOffRequestMapper.toPersistence(timeOffRequest);
    const saved = await this.repository.save(entity);
    return TimeOffRequestMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
