import { User } from '@/models/User';

export interface UserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  delete(id: string): Promise<void>;
}
