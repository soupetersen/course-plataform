import { Enrollment } from '@/models/Enrollment';

export interface EnrollmentRepository {
  create(enrollment: Enrollment): Promise<Enrollment>;
  findById(id: string): Promise<Enrollment | null>;
  findAll(): Promise<Enrollment[]>;
  findByUserId(userId: string): Promise<Enrollment[]>;
  findByCourseId(courseId: string): Promise<Enrollment[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
  update(id: string, enrollment: Enrollment): Promise<Enrollment>;
  delete(id: string): Promise<void>;
  findActiveByUserId(userId: string): Promise<Enrollment[]>;
  findCompletedByUserId(userId: string): Promise<Enrollment[]>;
}
