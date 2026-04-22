import { HcmClientImpl } from './hcm/hcm.client.impl';
import { TimeOffTypeOrmRepository } from './persistence/time-off.repository';
import { LeaveType } from '../domain/entities/leave-type.enum';
import { TimeOffRequest } from '../domain/entities/time-off-request';
import { TimeOffRequestStatus } from '../domain/entities/time-off-request-status.enum';
import { Balance } from '../domain/entities/balance';
import { HcmSyncLog } from '../domain/entities/hcm-sync-log';
import { Repository } from 'typeorm';
import { BalanceEntity } from './persistence/entities/balance.entity';
import { TimeOffRequestEntity } from './persistence/entities/time-off-request.entity';
import { HcmSyncLogEntity } from './persistence/entities/hcm-sync-log.entity';

describe('Infrastructure', () => {
  describe('HcmClientImpl', () => {
    let client: HcmClientImpl;
    let globalFetchSpy: jest.SpyInstance;

    beforeEach(() => {
      client = new HcmClientImpl();
      globalFetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      globalFetchSpy.mockRestore();
    });

    it('getRemoteBalance should fetch and map correctly', async () => {
      globalFetchSpy.mockResolvedValue({
        ok: true,
        json: async () => await Promise.resolve({ balance: 100 }),
      });

      const result = await client.getRemoteBalance(
        'E1',
        'L1',
        LeaveType.VACATION,
      );
      expect(result.currentBalance).toBe(100);
      expect(globalFetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/balances/E1/L1'),
      );
    });

    it('sendTimeOffRequest should post correctly', async () => {
      globalFetchSpy.mockResolvedValue({
        ok: true,
        json: async () => await Promise.resolve({ hcm_ref_id: 'REF1' }),
      });

      const request = new TimeOffRequest({ id: 'R1', idempotencyKey: 'K1' });
      const result = await client.sendTimeOffRequest(request);
      expect(result).toBe('REF1');
      expect(globalFetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/time-off'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('getBatchBalances should fetch and map correctly', async () => {
      globalFetchSpy.mockResolvedValue({
        ok: true,
        json: async () =>
          await Promise.resolve([
            {
              employeeId: 'E1',
              locationId: 'L1',
              leaveTypeId: 'VACATION',
              balance: 50,
            },
          ]),
      });

      const result = await client.getBatchBalances();
      expect(result[0].currentBalance).toBe(50);
    });

    it('should throw error on non-ok response', async () => {
      globalFetchSpy.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });
      await expect(client.getBatchBalances()).rejects.toThrow(
        'HCM Error: Bad Request',
      );
    });
  });

  describe('TimeOffTypeOrmRepository', () => {
    let repo: TimeOffTypeOrmRepository;
    let mockBalanceRepo: jest.Mocked<Repository<BalanceEntity>>;
    let mockRequestRepo: jest.Mocked<Repository<TimeOffRequestEntity>>;
    let mockSyncLogRepo: jest.Mocked<Repository<HcmSyncLogEntity>>;

    beforeEach(() => {
      mockBalanceRepo = {
        findOneBy: jest.fn(),
        findBy: jest.fn(),
        save: jest.fn(),
      } as unknown as jest.Mocked<Repository<BalanceEntity>>;
      mockRequestRepo = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
      } as unknown as jest.Mocked<Repository<TimeOffRequestEntity>>;
      mockSyncLogRepo = { save: jest.fn() } as unknown as jest.Mocked<
        Repository<HcmSyncLogEntity>
      >;
      repo = new TimeOffTypeOrmRepository(
        mockBalanceRepo,
        mockRequestRepo,
        mockSyncLogRepo,
      );
    });

    it('findBalance should call findOneBy and map', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockBalanceRepo.findOneBy.mockResolvedValue({
        employee_id: 'E1',
        current_balance: 10,
      } as any);
      const result = await repo.findBalance('E1', 'L1', LeaveType.VACATION);
      expect(result?.employeeId).toBe('E1');
    });

    it('saveBalance should call save', async () => {
      const domain = new Balance({ employeeId: 'E1' });
      await repo.saveBalance(domain);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockBalanceRepo.save).toHaveBeenCalled();
    });

    it('findRequestById should call findOne', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRequestRepo.findOne.mockResolvedValue({
        id: 'R1',
        status: 'PENDING_APPROVAL',
      } as any);
      await repo.findRequestById('R1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRequestRepo.findOne).toHaveBeenCalled();
    });

    it('findActiveRequestsByEmployee should call find with In operator', async () => {
      mockRequestRepo.find.mockResolvedValue([]);
      await repo.findActiveRequestsByEmployee('E1', 'L1', [
        TimeOffRequestStatus.APPROVED,
      ]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRequestRepo.find).toHaveBeenCalled();
    });

    it('saveSyncLog should call save', async () => {
      const domain = new HcmSyncLog({ id: 'S1' });
      await repo.saveSyncLog(domain);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSyncLogRepo.save).toHaveBeenCalled();
    });

    it('findPending should handle locationId correctly', async () => {
      mockRequestRepo.find.mockResolvedValue([]);
      await repo.findPending('L1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRequestRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({ location_id: 'L1' }),
        }),
      );
    });
  });
});
