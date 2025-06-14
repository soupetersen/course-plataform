import { Module } from '@/models/Module';
import { ModuleRepository } from '@/interfaces/ModuleRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { CreateModuleDto } from '@/dtos/ModuleDto';

export class CreateModuleUseCase {
  constructor(
    private moduleRepository: ModuleRepository,
    private courseRepository: CourseRepository
  ) {}

  async execute(data: CreateModuleDto): Promise<Module> {
    const course = await this.courseRepository.findById(data.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const module = Module.create({
      title: data.title,
      description: data.description,
      order: data.order || 1,
      courseId: data.courseId
    });

    const savedModule = await this.moduleRepository.create(module);
    return savedModule;
  }
}
