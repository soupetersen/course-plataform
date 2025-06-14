import { Lesson } from '@/models/Lesson';

export interface LessonRepository {
  create(data: Partial<Lesson>): Promise<Lesson>;
  findById(id: string): Promise<Lesson | null>;
  findByCourseId(courseId: string): Promise<Lesson[]>;
  findByModuleId(moduleId: string): Promise<Lesson[]>;
  update(id: string, data: Partial<Lesson>): Promise<Lesson>;
  delete(id: string): Promise<void>;
}
