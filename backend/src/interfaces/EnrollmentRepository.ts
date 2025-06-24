import { Enrollment } from '@/models/Enrollment';

export interface EnrollmentRepository {
  create(enrollment: Enrollment): Promise<Enrollment>;
  findById(id: string): Promise<Enrollment | null>;
  findAll(): Promise<Enrollment[]>;
  findByUserId(userId: string): Promise<any[]>; // Retorna dados completos com curso incluído
  findByCourseId(courseId: string): Promise<Enrollment[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
  update(id: string, enrollment: Enrollment): Promise<Enrollment>;
  delete(id: string): Promise<void>;
  findActiveByUserId(userId: string): Promise<any[]>; // Retorna dados completos com curso incluído
  findCompletedByUserId(userId: string): Promise<any[]>; // Retorna dados completos com curso incluído
  addUserToCourse(courseId: string, userId: string): Promise<Enrollment>;
  pauseUserEnrollment(courseId: string, userId: string): Promise<void>;
  resumeUserEnrollment(courseId: string, userId: string): Promise<void>;
  removeUserFromCourse(courseId: string, userId: string): Promise<void>;
}
