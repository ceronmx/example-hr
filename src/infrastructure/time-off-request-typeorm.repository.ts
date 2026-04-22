import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeOffRequest } from '../domain/time-off-request.entity';
import { TimeOffRequestRepository } from '../application/time-off-request.repository';

@Injectable()
export class TimeOffRequestTypeOrmRepository implements TimeOffRequestRepository {
  constructor(
    @InjectRepository(TimeOffRequest)
    private readonly repository: Repository<TimeOffRequest>,
  ) {}

  findAll(): Promise<TimeOffRequest[]> {
    return this.repository.find({ relations: ['balance'] });
  }

  findById(id: string): Promise<TimeOffRequest | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['balance'],
    });
  }

  save(timeOffRequest: TimeOffRequest): Promise<TimeOffRequest> {
    return this.repository.save(timeOffRequest);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
