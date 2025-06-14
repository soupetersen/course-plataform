import { LessonComment } from '@/models/LessonComment';

export interface LessonCommentRepository {
  create(data: Partial<LessonComment>): Promise<LessonComment>;
  findById(id: string): Promise<LessonComment | null>;
  findByLessonId(lessonId: string): Promise<LessonComment[]>;
  delete(id: string): Promise<void>;
}
