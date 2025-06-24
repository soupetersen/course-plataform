import { Question, QuestionOption } from '@/models/Question';

export interface QuestionRepository {
  create(data: Partial<Question>): Promise<Question>;
  findById(id: string): Promise<Question | null>;
  findByLessonId(lessonId: string): Promise<Question[]>;
  update(id: string, data: Partial<Question>): Promise<Question>;
  delete(id: string): Promise<void>;
  
  // Question Options
  createOption(data: Partial<QuestionOption>): Promise<QuestionOption>;
  findOptionsByQuestionId(questionId: string): Promise<QuestionOption[]>;
  updateOption(id: string, data: Partial<QuestionOption>): Promise<QuestionOption>;
  deleteOption(id: string): Promise<void>;
  deleteOptionsByQuestionId(questionId: string): Promise<void>;
}
