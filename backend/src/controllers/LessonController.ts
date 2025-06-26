import { FastifyRequest, FastifyReply } from 'fastify';
import {
  CreateLessonDto,
  UpdateLessonDto,
  LessonResponseDto,
  CreateLessonCommentDto
} from '@/dtos/LessonDto';
import { CreateLessonUseCase } from '@/use-cases/CreateLessonUseCase';
import { CompleteLessonUseCase } from '@/use-cases/CompleteLessonUseCase';
import { LessonRepository } from '@/interfaces/LessonRepository';
import { LessonCommentRepository } from '@/interfaces/LessonCommentRepository';
import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { LessonType } from '@/models/Lesson';
import { UserInfo } from '@/middlewares/AuthMiddleware';

export class LessonController {
  constructor(
    private lessonRepository: LessonRepository,
    private lessonCommentRepository: LessonCommentRepository,
    private enrollmentRepository: EnrollmentRepository,
    private courseRepository: CourseRepository,
    private createLessonUseCase: CreateLessonUseCase,
    private completeLessonUseCase: CompleteLessonUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      const { courseId } = request.params as { courseId: string };
      const data = request.body as CreateLessonDto;
      if (!userInfo) {
        return reply.status(401).send({ success: false, error: 'Authentication required' });
      }
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        return reply.status(404).send({ success: false, error: 'Course not found' });
      }
      if (course.instructorId !== userInfo.userId && userInfo.role !== 'ADMIN') {
        return reply.status(403).send({ success: false, error: 'You do not have permission to create lessons for this course' });
      }      const lesson = await this.createLessonUseCase.execute({ ...data, courseId });
      const response: LessonResponseDto = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        videoDuration: lesson.videoDuration,
        duration: lesson.duration,
        type: lesson.type,
        order: lesson.order,
        isPreview: lesson.isPreview,
        isLocked: lesson.isLocked,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        quizPassingScore: lesson.quizPassingScore,
        quizAttempts: lesson.quizAttempts,
        allowReview: lesson.allowReview,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      };
      return reply.status(201).send({ success: true, data: response, message: 'Lesson created successfully' });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message || 'Failed to create lesson' });
    }
  }

  async findByCourse(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      const { courseId } = request.params as { courseId: string };
      if (!userInfo) {
        return reply.status(401).send({ success: false, error: 'Authentication required' });
      }
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userInfo.userId, courseId);
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        return reply.status(404).send({ success: false, error: 'Course not found' });
      }
      const isInstructor = course.instructorId === userInfo.userId;
      const isAdmin = userInfo.role === 'ADMIN';
      const isEnrolled = !!enrollment;
      if (!isInstructor && !isAdmin && !isEnrolled) {
        return reply.status(403).send({ success: false, error: 'You must be enrolled in this course to view lessons' });
      }
      const lessons = await this.lessonRepository.findByCourseId(courseId);
      const response: LessonResponseDto[] = [];
      for (const lesson of lessons) {
        if (!isInstructor && !isAdmin && lesson.isLocked && !lesson.isPreview) {
          continue;
        }
        let progress: any = undefined;
        if (enrollment && (this.enrollmentRepository as any).getLessonProgress) {
          progress = await (this.enrollmentRepository as any).getLessonProgress(enrollment.id, lesson.id);
        }
        response.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          content: isInstructor || isAdmin || !lesson.isLocked || lesson.isPreview ? lesson.content : '',
          videoUrl: isInstructor || isAdmin || !lesson.isLocked || lesson.isPreview ? lesson.videoUrl : undefined,
          duration: lesson.duration,
          type: lesson.type,
          order: lesson.order,
          isPreview: lesson.isPreview,
          isLocked: lesson.isLocked,
          courseId: lesson.courseId,
          moduleId: lesson.moduleId,
          progress: progress || undefined,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt
        });
      }
      return reply.send({ success: true, data: response });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message || 'Failed to fetch lessons' });
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      const { id } = request.params as { id: string };
      if (!userInfo) {
        return reply.status(401).send({ success: false, error: 'Authentication required' });
      }
      const lesson = await this.lessonRepository.findById(id);
      if (!lesson) {
        return reply.status(404).send({ success: false, error: 'Lesson not found' });
      }
      const course = await this.courseRepository.findById(lesson.courseId);
      if (!course) {
        return reply.status(404).send({ success: false, error: 'Course not found' });
      }
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userInfo.userId, lesson.courseId);
      const isInstructor = course.instructorId === userInfo.userId;
      const isAdmin = userInfo.role === 'ADMIN';
      const isEnrolled = !!enrollment;
      if (!isInstructor && !isAdmin && !isEnrolled) {
        return reply.status(403).send({ success: false, error: 'You must be enrolled in this course to view lessons' });
      }
      if (!isInstructor && !isAdmin && lesson.isLocked && !lesson.isPreview) {
        return reply.status(403).send({ success: false, error: 'This lesson is locked. Complete previous lessons to unlock it.' });
      }
      let progress: any = undefined;
      if (enrollment && (this.enrollmentRepository as any).getLessonProgress) {
        progress = await (this.enrollmentRepository as any).getLessonProgress(enrollment.id, lesson.id);
      }
      const comments = await this.lessonCommentRepository.findByLessonId(lesson.id);
      const response: LessonResponseDto = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        type: lesson.type,
        order: lesson.order,
        isPreview: lesson.isPreview,
        isLocked: lesson.isLocked,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        progress: progress || undefined,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      };
      return reply.send({ success: true, data: response, comments });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message || 'Failed to fetch lesson' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      const { id } = request.params as { id: string };
      const data = request.body as UpdateLessonDto;
      if (!userInfo) {
        return reply.status(401).send({ success: false, error: 'Authentication required' });
      }
      const existingLesson = await this.lessonRepository.findById(id);
      if (!existingLesson) {
        return reply.status(404).send({ success: false, error: 'Lesson not found' });
      }
      const course = await this.courseRepository.findById(existingLesson.courseId);
      if (!course) {
        return reply.status(404).send({ success: false, error: 'Course not found' });
      }
      if (course.instructorId !== userInfo.userId && userInfo.role !== 'ADMIN') {
        return reply.status(403).send({ success: false, error: 'You do not have permission to update this lesson' });
      }
      const lesson = await this.lessonRepository.update(id, { ...data });
      const response: LessonResponseDto = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        type: lesson.type,
        order: lesson.order,
        isPreview: lesson.isPreview,
        isLocked: lesson.isLocked,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      };
      return reply.send({ success: true, data: response, message: 'Lesson updated successfully' });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message || 'Failed to update lesson' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      const { id } = request.params as { id: string };
      if (!userInfo) {
        return reply.status(401).send({ success: false, error: 'Authentication required' });
      }
      const existingLesson = await this.lessonRepository.findById(id);
      if (!existingLesson) {
        return reply.status(404).send({ success: false, error: 'Lesson not found' });
      }
      const course = await this.courseRepository.findById(existingLesson.courseId);
      if (!course) {
        return reply.status(404).send({ success: false, error: 'Course not found' });
      }
      if (course.instructorId !== userInfo.userId && userInfo.role !== 'ADMIN') {
        return reply.status(403).send({ success: false, error: 'You do not have permission to delete this lesson' });
      }
      await this.lessonRepository.delete(id);
      return reply.send({ success: true, message: 'Lesson deleted successfully' });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message || 'Failed to delete lesson' });
    }
  }

  async addComment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      const { id } = request.params as { id: string };
      const data = request.body as CreateLessonCommentDto;
      if (!userInfo) {
        return reply.status(401).send({ success: false, error: 'Authentication required' });
      }
      const lesson = await this.lessonRepository.findById(id);
      if (!lesson) {
        return reply.status(404).send({ success: false, error: 'Lesson not found' });
      }
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userInfo.userId, lesson.courseId);
      if (!enrollment) {
        return reply.status(403).send({ success: false, error: 'You are not enrolled in this course' });
      }
      const comment = await this.lessonCommentRepository.create({
        content: data.content,
        lessonId: id,
        enrollmentId: enrollment.id
      });
      return reply.status(201).send({ success: true, data: comment, message: 'Comment added successfully' });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message || 'Failed to add comment' });
    }
  }

  async getComments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const lesson = await this.lessonRepository.findById(id);
      if (!lesson) {
        return reply.status(404).send({ success: false, error: 'Lesson not found' });
      }
      const comments = await this.lessonCommentRepository.findByLessonId(id);
      return reply.send({ success: true, data: comments });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message || 'Failed to fetch comments' });
    }
  }
}
