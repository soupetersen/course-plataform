import { UserRepository } from '@/interfaces/UserRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { EmailService } from '@/services/EmailService';
import { Enrollment } from '@/models/Enrollment';

export interface NotifyCourseCompletionRequest {
  enrollment: Enrollment;
}

export interface NotifyCourseCompletionResponse {
  success: boolean;
  error?: string;
}

export class NotifyCourseCompletionUseCase {
  constructor(
    private userRepository: UserRepository,
    private courseRepository: CourseRepository,
    private emailService: EmailService
  ) {}

  async execute(request: NotifyCourseCompletionRequest): Promise<NotifyCourseCompletionResponse> {
    try {
      const { enrollment } = request;

      if (!enrollment.isCompleted()) {
        return {
          success: false,
          error: 'Curso não foi concluído'
        };
      }

      const user = await this.userRepository.findById(enrollment.userId);
      const course = await this.courseRepository.findById(enrollment.courseId);

      if (!user || !course) {
        return {
          success: false,
          error: 'Usuário ou curso não encontrado'
        };
      }

      await this.emailService.sendCourseCompletionEmail(user.email, {
        userName: user.name,
        courseName: course.title,
        completionDate: enrollment.completedAt!,
        certificateUrl: `${process.env.FRONTEND_URL}/certificates/${enrollment.id}`,
      });

      console.log(`✅ Email de conclusão de curso enviado para ${user.email}`);

      return {
        success: true
      };

    } catch (error) {
      console.error('Erro ao enviar notificação de conclusão de curso:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }
}
