import { TimeOffRequest } from '../../../domain/entities/time-off-request';
import {
  TimeOffRequestEntity,
  TimeOffStatus,
} from '../entities/time-off-request.entity';
import { TimeOffRequestStatus } from '../../../domain/entities/time-off-request-status.enum';
import { BalanceMapper } from './balance.mapper';

export class TimeOffRequestMapper {
  static toDomain(entity: TimeOffRequestEntity): TimeOffRequest {
    return new TimeOffRequest({
      id: entity.id,
      employee_id: entity.employee_id,
      location_id: entity.location_id,
      leave_type_id: entity.leave_type_id,
      days_requested: Number(entity.days_requested),
      start_date: entity.start_date,
      end_date: entity.end_date,
      status: this.toDomainStatus(entity.status),
      idempotency_key: entity.idempotency_key,
      hcm_ref_id: entity.hcm_ref_id,
      error_message: entity.error_message,
      created_at: entity.created_at,
      balance: entity.balance
        ? BalanceMapper.toDomain(entity.balance)
        : undefined,
    });
  }

  static toPersistence(domain: TimeOffRequest): TimeOffRequestEntity {
    const entity = new TimeOffRequestEntity();
    entity.id = domain.id;
    entity.employee_id = domain.employee_id;
    entity.location_id = domain.location_id;
    entity.leave_type_id = domain.leave_type_id;
    entity.days_requested = domain.days_requested;
    entity.start_date = domain.start_date;
    entity.end_date = domain.end_date;
    entity.status = this.toPersistenceStatus(domain.status);
    entity.idempotency_key = domain.idempotency_key;
    entity.hcm_ref_id = domain.hcm_ref_id!;
    entity.error_message = domain.error_message!;
    if (domain.created_at) {
      entity.created_at = domain.created_at;
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
