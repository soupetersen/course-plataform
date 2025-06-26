import { Course } from '@/models/Course';

export interface CourseRepository {
  create(data: Partial<Course>): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  findByInstructorId(instructorId: string): Promise<Course[]>;
  update(id: string, data: Partial<Course>): Promise<Course>;
  delete(id: string): Promise<void>;
}
