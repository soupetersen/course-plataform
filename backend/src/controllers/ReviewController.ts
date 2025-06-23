import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { ReviewRepository } from '@/interfaces/ReviewRepository';
import { CreateReviewUseCase } from '@/use-cases/CreateReviewUseCase';
import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto, CourseRatingStatsDto } from '@/dtos/ReviewDto';

interface ReviewParams {
  id: string;
}

interface CourseParams {
  courseId: string;
}

export class ReviewController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'Você precisa estar logado para avaliar um curso.'
        });
      }

      const { courseId } = request.params as CourseParams;
      const data = request.body as CreateReviewDto;

      const createReviewUseCase = this.container.resolve<CreateReviewUseCase>('CreateReviewUseCase');
      const review = await createReviewUseCase.execute({ ...data, courseId }, userInfo.userId);

      const response: ReviewResponseDto = {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId,
        courseId: review.courseId,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };

      reply.status(201).send({
        success: true,
        data: response
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Não foi possível criar a avaliação. Tente novamente.'
      });
    }
  }

  async findByCourse(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { courseId } = request.params as CourseParams;
      
      const reviewRepository = this.container.resolve<ReviewRepository>('ReviewRepository');
      const reviews = await reviewRepository.findByCourseId(courseId);

      const response: ReviewResponseDto[] = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId,
        courseId: review.courseId,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      }));

      reply.send({
        success: true,
        data: response
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Não foi possível carregar as avaliações. Tente novamente.'
      });
    }
  }

  async getCourseRatingStats(request: FastifyRequest<{ Params: CourseParams }>, reply: FastifyReply) {
    try {
      const { courseId } = request.params;
      
      const reviewRepository = this.container.resolve<ReviewRepository>('ReviewRepository');
      const [averageRating, totalReviews, allReviews] = await Promise.all([
        reviewRepository.getAverageRatingByCourse(courseId),
        reviewRepository.getReviewCountByCourse(courseId),
        reviewRepository.findByCourseId(courseId)
      ]);

      const ratingDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      };

      allReviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      const response: CourseRatingStatsDto = {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution
      };

      reply.send({
        success: true,
        data: response
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Não foi possível carregar rating stats. Tente novamente.'
      });
    }
  }

  async update(request: FastifyRequest<{ Params: ReviewParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'Você precisa estar logado para avaliar cursos.'
        });
      }

      const { id } = request.params;
      const data = request.body as UpdateReviewDto;

      const reviewRepository = this.container.resolve<ReviewRepository>('ReviewRepository');
      
      const existingReview = await reviewRepository.findById(id);
      if (!existingReview) {
        return reply.status(404).send({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      if (existingReview.userId !== userInfo.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Você só pode atualizar suas próprias avaliações'
        });
      }

      if (data.rating && (data.rating < 1 || data.rating > 5)) {
        return reply.status(400).send({
          success: false,
          message: 'A nota deve estar entre 1 e 5'
        });
      }

      const updatedReview = await reviewRepository.update(id, data);

      const response: ReviewResponseDto = {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        userId: updatedReview.userId,
        courseId: updatedReview.courseId,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
      };

      reply.send({
        success: true,
        data: response
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Não foi possível atualizar review. Tente novamente.'
      });
    }
  }

  async delete(request: FastifyRequest<{ Params: ReviewParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'Você precisa estar logado para avaliar cursos.'
        });
      }

      const { id } = request.params;

      const reviewRepository = this.container.resolve<ReviewRepository>('ReviewRepository');
      
      const existingReview = await reviewRepository.findById(id);
      if (!existingReview) {
        return reply.status(404).send({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      if (existingReview.userId !== userInfo.userId && userInfo.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          message: 'Você só pode deletar suas próprias avaliações'
        });
      }

      await reviewRepository.delete(id);

      reply.send({
        success: true,
        message: 'Avaliação deletada com sucesso'
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Não foi possível excluir review. Tente novamente.'
      });
    }
  }

  async findByUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'Você precisa estar logado para avaliar cursos.'
        });
      }

      const reviewRepository = this.container.resolve<ReviewRepository>('ReviewRepository');
      const reviews = await reviewRepository.findByUserId(userInfo.userId);

      const response: ReviewResponseDto[] = reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId,
        courseId: review.courseId,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      }));

      reply.send({
        success: true,
        data: response
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Não foi possível carregar user reviews. Tente novamente.'
      });
    }
  }
}
