import { CreateRequestUseCase } from './create-request.use-case';
import { ApproveRequestUseCase } from './approve-request.use-case';
import { GetEmployeeBalancesUseCase } from './get-employee-balances.use-case';
import { SyncBatchBalancesUseCase } from './sync-batch-balances.use-case';
import { GetPendingRequestsUseCase } from './get-pending-requests.use-case';
import { ITimeOffRepository } from '../ports/time-off-repository.interface';
import { IHcmClient } from '../ports/hcm-client.interface';
import { TimeOffRequest } from '../../domain/entities/time-off-request';
import { TimeOffRequestStatus } from '../../domain/entities/time-off-request-status.enum';
import { LeaveType } from '../../domain/entities/leave-type.enum';
import { Balance } from '../../domain/entities/balance';
import { InsufficientBalanceException } from '../../domain/exceptions/insufficient-balance.exception';

describe('Application Use Cases', () => {
  let repository: jest.Mocked<ITimeOffRepository>;
  let hcmClient: jest.Mocked<IHcmClient>;

  beforeEach(() => {
    repository = {
      findBalance: jest.fn(),
      findAllBalancesByEmployee: jest.fn(),
      saveBalance: jest.fn(),
      findRequestById: jest.fn(),
      findPendingRequests: jest.fn(),
      findActiveRequestsByEmployee: jest.fn(),
      saveRequest: jest.fn(),
      saveSyncLog: jest.fn(),
      findPending: jest.fn(),
      findPendingByLocation: jest.fn(),
    };

    hcmClient = {
      sendTimeOffRequest: jest.fn(),
      getBatchBalances: jest.fn(),
      getRemoteBalance: jest.fn(),
    };
  });

  describe('CreateRequestUseCase', () => {
    it('should create a request successfully when balance is sufficient', async () => {
      const useCase = new CreateRequestUseCase(repository);
      const balance = new Balance({
        employeeId: 'EMP-001',
        locationId: 'LOC-001',
        leaveTypeId: LeaveType.VACATION,
        currentBalance: 20,
        lastSyncedAt: new Date(),
      });

      repository.findBalance.mockResolvedValue(balance);
      repository.findPendingRequests.mockResolvedValue([]);

      const result = await useCase.execute({
        employeeId: 'EMP-001',
        locationId: 'LOC-001',
        leaveTypeId: LeaveType.VACATION,
        daysRequested: 5,
        startDate: new Date(),
        endDate: new Date(),
      });

      expect(result).toBeInstanceOf(TimeOffRequest);
      expect(result.status).toBe(TimeOffRequestStatus.PENDING_APPROVAL);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.saveRequest).toHaveBeenCalled();
    });

    it('should throw InsufficientBalanceException when projected balance is too low', async () => {
      const useCase = new CreateRequestUseCase(repository);
      const balance = new Balance({
        employeeId: 'EMP-001',
        locationId: 'LOC-001',
        leaveTypeId: LeaveType.VACATION,
        currentBalance: 10,
        lastSyncedAt: new Date(),
      });

      repository.findBalance.mockResolvedValue(balance);
      repository.findPendingRequests.mockResolvedValue([
        new TimeOffRequest({ daysRequested: 8 }),
      ]);

      await expect(
        useCase.execute({
          employeeId: 'EMP-001',
          locationId: 'LOC-001',
          leaveTypeId: LeaveType.VACATION,
          daysRequested: 5,
          startDate: new Date(),
          endDate: new Date(),
        }),
      ).rejects.toThrow(InsufficientBalanceException);
    });
  });

  describe('ApproveRequestUseCase', () => {
    it('should transition to SYNCED on successful HCM sync', async () => {
      const useCase = new ApproveRequestUseCase(repository, hcmClient);
      const request = new TimeOffRequest({
        id: 'REQ-1',
        status: TimeOffRequestStatus.PENDING_APPROVAL,
      });

      repository.findRequestById.mockResolvedValue(request);
      hcmClient.sendTimeOffRequest.mockResolvedValue('HCM-REF-123');

      const result = await useCase.execute({
        requestId: 'REQ-1',
        managerId: 'MGR-1',
      });

      expect(result.status).toBe(TimeOffRequestStatus.SYNCED);
      expect(result.hcmRefId).toBe('HCM-REF-123');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.saveRequest).toHaveBeenCalledTimes(3); // Transitions: APPROVED -> SYNCING -> SYNCED
    });

    it('should transition to FAILED_SYNC when HCM client fails', async () => {
      const useCase = new ApproveRequestUseCase(repository, hcmClient);
      const request = new TimeOffRequest({
        id: 'REQ-1',
        status: TimeOffRequestStatus.PENDING_APPROVAL,
      });

      repository.findRequestById.mockResolvedValue(request);
      hcmClient.sendTimeOffRequest.mockRejectedValue(new Error('HCM Down'));

      const result = await useCase.execute({
        requestId: 'REQ-1',
        managerId: 'MGR-1',
      });

      expect(result.status).toBe(TimeOffRequestStatus.FAILED_SYNC);
      expect(result.errorMessage).toBe('HCM Down');
    });
  });

  describe('GetEmployeeBalancesUseCase', () => {
    it('should calculate projected balance correctly (Actual - Pending)', async () => {
      const useCase = new GetEmployeeBalancesUseCase(repository);

      repository.findAllBalancesByEmployee.mockResolvedValue([
        new Balance({ leaveTypeId: 'VACATION', currentBalance: 20 } as any),
      ]);

      repository.findActiveRequestsByEmployee.mockResolvedValue([
        new TimeOffRequest({
          leaveTypeId: 'VACATION',
          daysRequested: 5,
          status: TimeOffRequestStatus.PENDING_APPROVAL,
        } as any),
        new TimeOffRequest({
          leaveTypeId: 'VACATION',
          daysRequested: 3,
          status: TimeOffRequestStatus.APPROVED,
        } as any),
      ]);

      const result = await useCase.execute({
        employeeId: 'E1',
        locationId: 'L1',
      });

      expect(result[0]).toEqual({
        leaveTypeId: 'VACATION',
        actualBalance: 20,
        projectedBalance: 12, // 20 - (5 + 3)
      });
    });
  });

  describe('SyncBatchBalancesUseCase', () => {
    it('should upsert balances and log success', async () => {
      const useCase = new SyncBatchBalancesUseCase(repository, hcmClient);
      const balances = [new Balance({ employeeId: 'E1', currentBalance: 10 })];

      hcmClient.getBatchBalances.mockResolvedValue(balances);

      await useCase.execute();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.saveBalance).toHaveBeenCalledWith(balances[0]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.saveSyncLog).toHaveBeenCalled();
    });
  });

  describe('GetPendingRequestsUseCase', () => {
    it('should return pending requests from repository', async () => {
      const useCase = new GetPendingRequestsUseCase(repository);
      const requests = [new TimeOffRequest({ id: 'R1' })];
      repository.findPending.mockResolvedValue(requests);

      const result = await useCase.execute({
        managerId: 'M1',
        locationId: 'L1',
      });

      expect(result).toBe(requests);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findPending).toHaveBeenCalledWith('L1');
    });
  });
});
