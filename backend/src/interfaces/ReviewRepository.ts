import { Review } from '@/models/Review';

export interface ReviewRepository {
  create(data: Partial<Review>): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findByCourseId(courseId: string): Promise<Review[]>;
  findByUserId(userId: string): Promise<Review[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Review | null>;
  update(id: string, data: Partial<Review>): Promise<Review>;
  delete(id: string): Promise<void>;
  getAverageRatingByCourse(courseId: string): Promise<number>;
  getReviewCountByCourse(courseId: string): Promise<number>;
}
