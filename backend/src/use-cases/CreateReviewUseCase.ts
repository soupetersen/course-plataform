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
      throw new Error('Você precisa estar inscrito neste curso para poder avaliá-lo.');
    }

    if (enrollment.progress < 20) {
      throw new Error('Você precisa completar pelo menos 20% do curso para poder avaliá-lo.');
    }

    const existingReview = await this.reviewRepository.findByUserAndCourse(userId, data.courseId);
    if (existingReview) {
      throw new Error('Você já avaliou este curso. Apenas uma avaliação por curso é permitida.');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new Error('A avaliação deve ser entre 1 e 5 estrelas.');
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
