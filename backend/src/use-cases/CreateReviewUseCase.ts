import { Review } from '@/models/Review';
import { ReviewRepository } from '@/interfaces/ReviewRepository';
import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { CreateReviewDto } from '@/dtos/ReviewDto';
import { randomUUID } from 'crypto';

export class CreateReviewUseCase {
  constructor(
    private reviewRepository: ReviewRepository,
    private enrollmentRepository: EnrollmentRepository
  ) {}

  async execute(data: CreateReviewDto, userId: string): Promise<Review> {
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, data.courseId);
    if (!enrollment) {
      throw new Error('You must be enrolled in this course to leave a review');
    }

    const existingReview = await this.reviewRepository.findByUserAndCourse(userId, data.courseId);
    if (existingReview) {
      throw new Error('You have already reviewed this course');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = new Review({
      id: randomUUID(),
      rating: data.rating,
      comment: data.comment,
      userId,
      courseId: data.courseId,
    });

    return await this.reviewRepository.create(review);
  }
}
