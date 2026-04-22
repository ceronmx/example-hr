import { ITimeOffRepository } from '../ports/time-off-repository.interface';
import { TimeOffRequestStatus } from '../../domain/entities/time-off-request-status.enum';

export interface GetEmployeeBalancesInput {
  employeeId: string;
  locationId: string;
}

export interface EmployeeBalanceOutput {
  leaveTypeId: string;
  actualBalance: number;
  projectedBalance: number;
}

export class GetEmployeeBalancesUseCase {
  constructor(private readonly repository: ITimeOffRepository) {}

  async execute(
    input: GetEmployeeBalancesInput,
  ): Promise<EmployeeBalanceOutput[]> {
    const { employeeId, locationId } = input;

    // 1. Fetch all balances for the employee
    const balances = await this.repository.findAllBalancesByEmployee(
      employeeId,
      locationId,
    );

    // 2. Fetch all "active" requests (Status: PENDING_APPROVAL, APPROVED, SYNCING)
    const activeStatuses = [
      TimeOffRequestStatus.PENDING_APPROVAL,
      TimeOffRequestStatus.APPROVED,
      TimeOffRequestStatus.SYNCING,
    ];

    const activeRequests = await this.repository.findActiveRequestsByEmployee(
      employeeId,
      locationId,
      activeStatuses,
    );

    // 3. For each LeaveType, calculate the Projected Balance
    return balances.map((balance) => {
      const relatedRequests = activeRequests.filter(
        (req) => req.leaveTypeId === balance.leaveTypeId,
      );

      const totalRequested = relatedRequests.reduce(
        (sum, req) => sum + req.daysRequested,
        0,
      );

      return {
        leaveTypeId: balance.leaveTypeId,
        actualBalance: balance.currentBalance,
        projectedBalance: balance.currentBalance - totalRequested,
      };
    });
  }
}
