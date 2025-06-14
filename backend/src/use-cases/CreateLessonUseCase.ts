import { Lesson } from '@/models/Lesson';
import { LessonRepository } from '@/interfaces/LessonRepository';
import { ModuleRepository } from '@/interfaces/ModuleRepository';
import { CreateLessonDto } from '@/dtos/LessonDto';

export class CreateLessonUseCase {
  constructor(
    private lessonRepository: LessonRepository,
    private moduleRepository: ModuleRepository
  ) {}

  async execute(data: CreateLessonDto): Promise<Lesson> {
    const module = await this.moduleRepository.findById(data.moduleId);
    if (!module) {
      throw new Error('Module not found');
    }

    const lesson = Lesson.create({
      title: data.title,
      content: data.content,
      description: data.description,
      videoUrl: data.videoUrl,
      duration: data.duration || 0,
      order: data.order || 1,
      moduleId: data.moduleId,
      courseId: data.courseId,
      type: data.type,
      isPreview: data.isPreview,
      isLocked: data.isLocked
    });

    const savedLesson = await this.lessonRepository.create(lesson);
    return savedLesson;
  }
}
