import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITimeOffRepository } from '../../application/ports/time-off-repository.interface';
import { Balance } from '../../domain/entities/balance';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { HcmSyncLog } from '../../domain/entities/hcm-sync-log';
import { BalanceEntity } from './entities/balance.entity';
import {
  TimeOffRequestEntity,
  TimeOffStatus,
} from './entities/time-off-request.entity';
import { HcmSyncLogEntity } from './entities/hcm-sync-log.entity';
import { BalanceMapper } from './mappers/balance.mapper';
import { TimeOffRequestMapper } from './mappers/time-off-request.mapper';
import { HcmSyncLogMapper } from './mappers/hcm-sync-log.mapper';
import { LeaveType } from '../../domain/entities/leave-type.enum';

@Injectable()
export class TimeOffTypeOrmRepository implements ITimeOffRepository {
  constructor(
    @InjectRepository(BalanceEntity)
    private readonly balanceRepo: Repository<BalanceEntity>,
    @InjectRepository(TimeOffRequestEntity)
    private readonly requestRepo: Repository<TimeOffRequestEntity>,
    @InjectRepository(HcmSyncLogEntity)
    private readonly syncLogRepo: Repository<HcmSyncLogEntity>,
  ) {}

  async findBalance(
    employeeId: string,
    locationId: string,
    leaveTypeId: LeaveType,
  ): Promise<Balance | null> {
    const entity = await this.balanceRepo.findOneBy({
      employee_id: employeeId,
      location_id: locationId,
      leave_type_id: leaveTypeId as string,
    });
    return entity ? BalanceMapper.toDomain(entity) : null;
  }

  async saveBalance(balance: Balance): Promise<void> {
    const entity = BalanceMapper.toPersistence(balance);
    await this.balanceRepo.save(entity);
  }

  async findRequestById(id: string): Promise<TimeOffRequest | null> {
    const entity = await this.requestRepo.findOne({
      where: { id },
      relations: ['balance'],
    });
    return entity ? TimeOffRequestMapper.toDomain(entity) : null;
  }

  async findPendingRequests(
    employeeId: string,
    locationId: string,
    leaveTypeId: LeaveType,
  ): Promise<TimeOffRequest[]> {
    const entities = await this.requestRepo.find({
      where: {
        employee_id: employeeId,
        location_id: locationId,
        leave_type_id: leaveTypeId as string,
        status: TimeOffStatus.PENDING_APPROVAL,
      },
    });
    return entities.map((e) => TimeOffRequestMapper.toDomain(e));
  }

  async saveRequest(request: TimeOffRequest): Promise<void> {
    const entity = TimeOffRequestMapper.toPersistence(request);
    await this.requestRepo.save(entity);
  }

  async saveSyncLog(log: HcmSyncLog): Promise<void> {
    const entity = HcmSyncLogMapper.toPersistence(log);
    await this.syncLogRepo.save(entity);
  }

  async findPending(locationId?: string): Promise<TimeOffRequest[]> {
    const where: { status: TimeOffStatus; location_id?: string } = {
      status: TimeOffStatus.PENDING_APPROVAL,
    };
    if (locationId) {
      where.location_id = locationId;
    }
    const entities = await this.requestRepo.find({
      where,
      relations: ['balance'],
    });
    return entities.map((e) => TimeOffRequestMapper.toDomain(e));
  }

  async findPendingByLocation(locationId: string): Promise<TimeOffRequest[]> {
    return this.findPending(locationId);
  }
}
