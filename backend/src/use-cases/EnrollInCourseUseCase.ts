import { Enrollment } from '@/models/Enrollment';
import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';

export class EnrollInCourseUseCase {
  constructor(
    private enrollmentRepository: EnrollmentRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string, courseId: string): Promise<Enrollment> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (existingEnrollment) {
      if (existingEnrollment.isActive) {
        throw new Error('User is already enrolled in this course');
      } else {
        existingEnrollment.reactivate();
        return await this.enrollmentRepository.update(existingEnrollment.id, existingEnrollment);
      }
    }

    const enrollment = Enrollment.create({
      userId,
      courseId
    });

    const savedEnrollment = await this.enrollmentRepository.create(enrollment);
    return savedEnrollment;
  }
}
