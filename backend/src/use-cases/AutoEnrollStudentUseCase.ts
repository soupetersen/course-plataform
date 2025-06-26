import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { EmailService } from '@/services/EmailService';
import { Enrollment } from '@/models/Enrollment';
import { PaymentStatus } from '@/models/Payment';

export interface AutoEnrollRequest {
  paymentId: string;
}

export interface AutoEnrollResponse {
  success: boolean;
  enrollment?: Enrollment;
  error?: string;
}

export class AutoEnrollStudentUseCase {
  constructor(
    private enrollmentRepository: EnrollmentRepository,
    private paymentRepository: PaymentRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(request: AutoEnrollRequest): Promise<AutoEnrollResponse> {
    try {
      const payment = await this.paymentRepository.findById(request.paymentId);
      if (!payment) {
        return {
          success: false,
          error: 'Pagamento não encontrado'
        };
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        return {
          success: false,
          error: 'Pagamento não foi aprovado'
        };
      }

      const user = await this.userRepository.findById(payment.userId);
      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      const course = await this.courseRepository.findById(payment.courseId);
      if (!course) {
        return {
          success: false,
          error: 'Curso não encontrado'
        };
      }

      const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(
        payment.userId,
        payment.courseId
      );

      if (existingEnrollment) {
        return {
          success: true,
          enrollment: existingEnrollment,
          error: 'Aluno já está matriculado no curso'
        };
      }

      const enrollment = Enrollment.create({
        userId: payment.userId,
        courseId: payment.courseId
      });

      const createdEnrollment = await this.enrollmentRepository.create(enrollment);

      try {
        const instructor = await this.userRepository.findById(course.instructorId);
        
        await this.emailService.sendEnrollmentConfirmationEmail(user.email, {
          userName: user.name,
          courseName: course.title,
          courseDescription: course.description,
          instructorName: instructor?.name,
          enrollmentDate: new Date(),
          courseUrl: `${process.env.FRONTEND_URL}/learn/${course.id}`,
        });
        
        console.log(`✅ Email de confirmação de matrícula enviado para ${user.email}`);
      } catch (emailError) {
        console.error('❌ Erro ao enviar email de confirmação de matrícula:', emailError);
      }

      return {
        success: true,
        enrollment: createdEnrollment
      };

    } catch (error) {
      console.error('Erro ao matricular aluno automaticamente:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}
