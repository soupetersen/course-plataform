import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { EnrollInCourseUseCase } from '@/use-cases/EnrollInCourseUseCase';
import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';

interface EnrollmentParams {
  id: string;
}

interface CourseEnrollmentBody {
  courseId: string;
}

export class EnrollmentController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  async enroll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { courseId } = request.body as CourseEnrollmentBody;
      
      const enrollInCourseUseCase = this.container.resolve<EnrollInCourseUseCase>('EnrollInCourseUseCase');
      const enrollment = await enrollInCourseUseCase.execute(userInfo.userId, courseId);

      reply.status(201).send({
        success: true,
        data: enrollment
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to enroll in course'
      });
    }
  }

  async getUserEnrollments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const enrollmentRepository = this.container.resolve<EnrollmentRepository>('EnrollmentRepository');
      const enrollments = await enrollmentRepository.findByUserId(userInfo.userId);

      reply.send({
        success: true,
        data: enrollments
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch enrollments'
      });
    }
  }

  async getUserEnrollmentsByUserId(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { userId } = request.params;

      
      if (userInfo.userId !== userId && userInfo.role !== 'INSTRUCTOR' && userInfo.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to view this user\'s enrollments'
        });
      }

      const enrollmentRepository = this.container.resolve<EnrollmentRepository>('EnrollmentRepository');
      const enrollments = await enrollmentRepository.findByUserId(userId);

      reply.send({
        success: true,
        data: enrollments
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user enrollments'
      });
    }
  }

  async getCourseEnrollments(request: FastifyRequest<{ Params: { courseId: string } }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { courseId } = request.params;

      const enrollmentRepository = this.container.resolve<EnrollmentRepository>('EnrollmentRepository');
      const enrollments = await enrollmentRepository.findByCourseId(courseId);

      reply.send({
        success: true,
        data: enrollments
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course enrollments'
      });
    }
  }

  async updateProgress(request: FastifyRequest<{ Params: EnrollmentParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;
      const { progress } = request.body as { progress: number };

      const enrollmentRepository = this.container.resolve<EnrollmentRepository>('EnrollmentRepository');
      
      const enrollment = await enrollmentRepository.findById(id);
      if (!enrollment) {
        return reply.status(404).send({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (enrollment.userId !== userInfo.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to update this enrollment'
        });
      }

      enrollment.updateProgress(progress);
      const updatedEnrollment = await enrollmentRepository.update(id, enrollment);

      reply.send({
        success: true,
        data: updatedEnrollment
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update enrollment progress'
      });
    }
  }

  async unenroll(request: FastifyRequest<{ Params: EnrollmentParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;

      const enrollmentRepository = this.container.resolve<EnrollmentRepository>('EnrollmentRepository');
      
      const enrollment = await enrollmentRepository.findById(id);
      if (!enrollment) {
        return reply.status(404).send({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (enrollment.userId !== userInfo.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to modify this enrollment'
        });
      }

      enrollment.deactivate();
      await enrollmentRepository.update(id, enrollment);

      reply.send({
        success: true,
        message: 'Successfully unenrolled from course'
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unenroll from course'
      });
    }
  }
}
