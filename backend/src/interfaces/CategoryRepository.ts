import { Category } from '@/models/Category';

export interface CategoryRepository {
  create(data: Partial<Category>): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  update(id: string, data: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
}
