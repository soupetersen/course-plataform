import { Module } from '@/models/Module';

export interface ModuleRepository {
  create(data: Partial<Module>): Promise<Module>;
  findById(id: string): Promise<Module | null>;
  findAll(): Promise<Module[]>;
  findByCourseId(courseId: string, userId?: string): Promise<Module[]>;
  update(id: string, data: Partial<Module>): Promise<Module>;
  delete(id: string): Promise<void>;
}
