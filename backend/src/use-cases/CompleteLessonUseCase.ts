import { LessonRepository } from '@/interfaces/LessonRepository';
import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';

export class CompleteLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private enrollmentRepository: EnrollmentRepository
  ) {}

  async execute(lessonId: string, userId: string): Promise<void> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    lesson.markAsCompleted();
    await this.lessonRepository.update(lessonId, lesson);

    if (lesson.moduleId) {
      const moduleLessons = await this.lessonRepository.findByModuleId(lesson.moduleId);
      const completedLessons = moduleLessons.filter(l => l.isCompleted);
      
      const progress = (completedLessons.length / moduleLessons.length) * 100;
      
      const enrollments = await this.enrollmentRepository.findByUserId(userId);
      if (enrollments.length > 0) {
        enrollments[0].updateProgress(progress);
        await this.enrollmentRepository.update(enrollments[0].id, enrollments[0]);
      }
    }
  }
}
