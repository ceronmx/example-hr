import { Balance } from '../../../domain/entities/balance';
import { BalanceEntity } from '../entities/balance.entity';
import { LeaveType } from '../../../domain/entities/leave-type.enum';

export class BalanceMapper {
  static toDomain(entity: BalanceEntity): Balance {
    return new Balance({
      employeeId: entity.employee_id,
      locationId: entity.location_id,
      leaveTypeId: entity.leave_type_id as LeaveType,
      currentBalance: Number(entity.current_balance),
      lastSyncedAt: entity.last_synced_at,
      updatedAt: entity.updated_at,
    });
  }

  static toPersistence(domain: Balance): BalanceEntity {
    const entity = new BalanceEntity();
    entity.employee_id = domain.employeeId;
    entity.location_id = domain.locationId;
    entity.leave_type_id = domain.leaveTypeId;
    entity.current_balance = domain.currentBalance;
    entity.last_synced_at = domain.lastSyncedAt;
    if (domain.updatedAt) {
      entity.updated_at = domain.updatedAt;
    }
    return entity;
  }
}
