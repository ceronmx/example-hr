import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { UserRepository } from '../application/user.repository';

@Injectable()
export class UserTypeOrmRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repository.find();
  }

  findById(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
