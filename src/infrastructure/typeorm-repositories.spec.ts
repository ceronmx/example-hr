import { BalanceTypeOrmRepository } from './balance-typeorm.repository';
import { TimeOffRequestTypeOrmRepository } from './time-off-request-typeorm.repository';
import { UserTypeOrmRepository } from './user-typeorm.repository';
import { Balance } from '../domain/entities/balance';
import { TimeOffRequest } from '../domain/entities/time-off-request';
import { User } from '../domain/user.entity';
import { Repository } from 'typeorm';
import { BalanceEntity } from './persistence/entities/balance.entity';
import { TimeOffRequestEntity } from './persistence/entities/time-off-request.entity';

describe('TypeORM Repositories', () => {
  describe('BalanceTypeOrmRepository', () => {
    let repo: BalanceTypeOrmRepository;
    let mockRepo: jest.Mocked<Repository<BalanceEntity>>;

    beforeEach(() => {
      mockRepo = {
        findOneBy: jest.fn(),
        findBy: jest.fn(),
        save: jest.fn(),
      } as unknown as jest.Mocked<Repository<BalanceEntity>>;
      repo = new BalanceTypeOrmRepository(mockRepo);
    });

    it('findByKeys should work', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRepo.findOneBy.mockResolvedValue({ employee_id: 'E1' } as any);
      await repo.findByKeys('E1', 'L1', 'V1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.findOneBy).toHaveBeenCalled();
    });

    it('findByEmployee should work', async () => {
      mockRepo.findBy.mockResolvedValue([]);
      await repo.findByEmployee('E1', 'L1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.findBy).toHaveBeenCalled();
    });

    it('save should work', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRepo.save.mockResolvedValue({ employee_id: 'E1' } as any);
      await repo.save(new Balance({ employeeId: 'E1' }));
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('TimeOffRequestTypeOrmRepository', () => {
    let repo: TimeOffRequestTypeOrmRepository;
    let mockRepo: jest.Mocked<Repository<TimeOffRequestEntity>>;

    beforeEach(() => {
      mockRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      } as unknown as jest.Mocked<Repository<TimeOffRequestEntity>>;
      repo = new TimeOffRequestTypeOrmRepository(mockRepo);
    });

    it('findAll should work', async () => {
      mockRepo.find.mockResolvedValue([]);
      await repo.findAll();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.find).toHaveBeenCalled();
    });

    it('findById should work', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRepo.findOne.mockResolvedValue({ id: 'R1' } as any);
      await repo.findById('R1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.findOne).toHaveBeenCalled();
    });

    it('findActiveByEmployee should work', async () => {
      mockRepo.find.mockResolvedValue([]);
      await repo.findActiveByEmployee('E1', 'L1', []);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.find).toHaveBeenCalled();
    });

    it('save should work', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRepo.save.mockResolvedValue({ id: 'R1' } as any);
      await repo.save(new TimeOffRequest({ id: 'R1' }));
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('delete should work', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRepo.delete.mockResolvedValue({} as any);
      await repo.delete('R1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.delete).toHaveBeenCalledWith('R1');
    });
  });

  describe('UserTypeOrmRepository', () => {
    let repo: UserTypeOrmRepository;
    let mockRepo: jest.Mocked<Repository<User>>;

    beforeEach(() => {
      mockRepo = {
        find: jest.fn(),
        findOneBy: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      } as unknown as jest.Mocked<Repository<User>>;
      repo = new UserTypeOrmRepository(mockRepo);
    });

    it('findAll should work', async () => {
      mockRepo.find.mockResolvedValue([]);
      await repo.findAll();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.find).toHaveBeenCalled();
    });

    it('findById should work', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRepo.findOneBy.mockResolvedValue({ id: 1 } as any);
      await repo.findById(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('save should work', async () => {
      const user = new User();
      mockRepo.save.mockResolvedValue(user);
      await repo.save(user);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.save).toHaveBeenCalledWith(user);
    });

    it('delete should work', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRepo.delete.mockResolvedValue({} as any);
      await repo.delete(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
