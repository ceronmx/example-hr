import { Balance } from '../../../domain/entities/balance';
import { BalanceEntity } from '../entities/balance.entity';

export class BalanceMapper {
  static toDomain(entity: BalanceEntity): Balance {
    return new Balance({
      employee_id: entity.employee_id,
      location_id: entity.location_id,
      leave_type_id: entity.leave_type_id,
      current_balance: Number(entity.current_balance),
      last_synced_at: entity.last_synced_at,
      updated_at: entity.updated_at,
    });
  }

  static toPersistence(domain: Balance): BalanceEntity {
    const entity = new BalanceEntity();
    entity.employee_id = domain.employee_id;
    entity.location_id = domain.location_id;
    entity.leave_type_id = domain.leave_type_id;
    entity.current_balance = domain.current_balance;
    entity.last_synced_at = domain.last_synced_at;
    if (domain.updated_at) {
      entity.updated_at = domain.updated_at;
    }
    return entity;
  }
}
