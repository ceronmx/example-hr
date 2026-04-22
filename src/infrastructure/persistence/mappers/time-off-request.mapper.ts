import { TimeOffRequest } from '../../../domain/entities/time-off-request';
import {
  TimeOffRequestEntity,
  TimeOffStatus,
} from '../entities/time-off-request.entity';
import { TimeOffRequestStatus } from '../../../domain/entities/time-off-request-status.enum';
import { BalanceMapper } from './balance.mapper';
import { LeaveType } from '../../../domain/entities/leave-type.enum';

export class TimeOffRequestMapper {
  static toDomain(entity: TimeOffRequestEntity): TimeOffRequest {
    return new TimeOffRequest({
      id: entity.id,
      employeeId: entity.employee_id,
      locationId: entity.location_id,
      leaveTypeId: entity.leave_type_id as LeaveType,
      daysRequested: Number(entity.days_requested),
      startDate: entity.start_date,
      endDate: entity.end_date,
      status: this.toDomainStatus(entity.status),
      idempotencyKey: entity.idempotency_key,
      hcmRefId: entity.hcm_ref_id,
      errorMessage: entity.error_message,
      createdAt: entity.created_at,
      balance: entity.balance
        ? BalanceMapper.toDomain(entity.balance)
        : undefined,
    });
  }

  static toPersistence(domain: TimeOffRequest): TimeOffRequestEntity {
    const entity = new TimeOffRequestEntity();
    entity.id = domain.id;
    entity.employee_id = domain.employeeId;
    entity.location_id = domain.locationId;
    entity.leave_type_id = domain.leaveTypeId;
    entity.days_requested = domain.daysRequested;
    entity.start_date = domain.startDate;
    entity.end_date = domain.endDate;
    entity.status = this.toPersistenceStatus(domain.status);
    entity.idempotency_key = domain.idempotencyKey;
    entity.hcm_ref_id = domain.hcmRefId!;
    entity.error_message = domain.errorMessage!;
    if (domain.createdAt) {
      entity.created_at = domain.createdAt;
    }
    if (domain.balance) {
      entity.balance = BalanceMapper.toPersistence(domain.balance);
    }
    return entity;
  }

  private static toDomainStatus(status: TimeOffStatus): TimeOffRequestStatus {
    return status as unknown as TimeOffRequestStatus;
  }

  private static toPersistenceStatus(
    status: TimeOffRequestStatus,
  ): TimeOffStatus {
    return status as unknown as TimeOffStatus;
  }
}
