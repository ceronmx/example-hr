import { Test, TestingModule } from '@nestjs/testing';
import { TimeOffController } from './time-off.controller';
import { SyncController } from './sync.controller';
import { CreateRequestUseCase } from '../../application/use-cases/create-request.use-case';
import { ApproveRequestUseCase } from '../../application/use-cases/approve-request.use-case';
import { GetPendingRequestsUseCase } from '../../application/use-cases/get-pending-requests.use-case';
import { GetEmployeeBalancesUseCase } from '../../application/use-cases/get-employee-balances.use-case';
import { SyncBatchBalancesUseCase } from '../../application/use-cases/sync-batch-balances.use-case';
import { BALANCE_REPOSITORY } from '../../application/balance.repository';
import { LeaveType } from '../../domain/entities/leave-type.enum';

describe('Controllers', () => {
  let timeOffController: TimeOffController;
  let syncController: SyncController;

  const mockCreateRequestUseCase = { execute: jest.fn().mockResolvedValue({}) };
  const mockApproveRequestUseCase = {
    execute: jest.fn().mockResolvedValue({}),
  };
  const mockGetPendingRequestsUseCase = {
    execute: jest.fn().mockResolvedValue([]),
  };
  const mockGetEmployeeBalancesUseCase = {
    execute: jest.fn().mockResolvedValue([]),
  };
  const mockSyncBatchBalancesUseCase = {
    execute: jest.fn().mockResolvedValue({}),
  };
  const mockBalanceRepo = { findBalance: jest.fn().mockResolvedValue({}) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeOffController, SyncController],
      providers: [
        { provide: CreateRequestUseCase, useValue: mockCreateRequestUseCase },
        { provide: ApproveRequestUseCase, useValue: mockApproveRequestUseCase },
        {
          provide: GetPendingRequestsUseCase,
          useValue: mockGetPendingRequestsUseCase,
        },
        {
          provide: GetEmployeeBalancesUseCase,
          useValue: mockGetEmployeeBalancesUseCase,
        },
        {
          provide: SyncBatchBalancesUseCase,
          useValue: mockSyncBatchBalancesUseCase,
        },
        { provide: BALANCE_REPOSITORY, useValue: mockBalanceRepo },
      ],
    }).compile();

    timeOffController = module.get<TimeOffController>(TimeOffController);
    syncController = module.get<SyncController>(SyncController);
  });

  describe('TimeOffController', () => {
    it('create() should call use case', async () => {
      const dto = {
        employeeId: 'E1',
        locationId: 'L1',
        leaveTypeId: LeaveType.VACATION,
        daysRequested: 1,
        startDate: '2026-01-01',
        endDate: '2026-01-02',
      };
      await timeOffController.create(dto);
      expect(mockCreateRequestUseCase.execute).toHaveBeenCalled();
    });

    it('approve() should call use case', async () => {
      await timeOffController.approve('R1', { managerId: 'M1' });
      expect(mockApproveRequestUseCase.execute).toHaveBeenCalledWith({
        requestId: 'R1',
        managerId: 'M1',
      });
    });

    it('getPending() should call use case', async () => {
      await timeOffController.getPending('M1', 'L1');
      expect(mockGetPendingRequestsUseCase.execute).toHaveBeenCalledWith({
        managerId: 'M1',
        locationId: 'L1',
      });
    });

    it('getEmployeeBalances() should call use case', async () => {
      await timeOffController.getEmployeeBalances('E1', 'L1');
      expect(mockGetEmployeeBalancesUseCase.execute).toHaveBeenCalledWith({
        employeeId: 'E1',
        locationId: 'L1',
      });
    });

    it('getBalances() should call repository', async () => {
      await timeOffController.getBalances('E1', 'L1');
      expect(mockBalanceRepo.findBalance).toHaveBeenCalledWith(
        'E1',
        'L1',
        LeaveType.VACATION,
      );
    });
  });

  describe('SyncController', () => {
    it('syncBatch() should call use case', async () => {
      await syncController.syncBatch();
      expect(mockSyncBatchBalancesUseCase.execute).toHaveBeenCalled();
    });
  });
});
