import { Course } from '@/models/Course';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { CreateCourseDto } from '@/dtos/CourseDto';

export class CreateCourseUseCase {
  constructor(
    private courseRepository: CourseRepository,
    private userRepository: UserRepository
  ) {}

  async execute(data: CreateCourseDto, instructorId: string): Promise<Course> {
    const instructor = await this.userRepository.findById(instructorId);
    if (!instructor) {
      throw new Error('Instructor not found');
    }

    if (!data.description) {
      throw new Error('Course description is required');
    }
    if (!data.categoryId) {
      throw new Error('Course category is required');
    }

    const course = Course.create({
      title: data.title,
      description: data.description,
      content: data.imageUrl,
      imageUrl: data.imageUrl,
      price: data.price,
      duration: 0,
      level: 'BEGINNER' as any,
      instructorId: instructorId,
      categoryId: data.categoryId
    });

    const savedCourse = await this.courseRepository.create(course);
    return savedCourse;
  }
}
