import { User } from '../domain/user.entity';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: number): Promise<void>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
