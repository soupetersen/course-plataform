import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
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
    private userRepository: UserRepository
  ) {}

  async execute(request: AutoEnrollRequest): Promise<AutoEnrollResponse> {
    try {
      // 1. Buscar o pagamento
      const payment = await this.paymentRepository.findById(request.paymentId);
      if (!payment) {
        return {
          success: false,
          error: 'Pagamento não encontrado'
        };
      }

      // 2. Verificar se o pagamento foi aprovado
      if (payment.status !== PaymentStatus.COMPLETED) {
        return {
          success: false,
          error: 'Pagamento não foi aprovado'
        };
      }

      // 3. Verificar se o usuário existe
      const user = await this.userRepository.findById(payment.userId);
      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // 4. Verificar se o curso existe
      const course = await this.courseRepository.findById(payment.courseId);
      if (!course) {
        return {
          success: false,
          error: 'Curso não encontrado'
        };
      }

      // 5. Verificar se o aluno já está matriculado
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

      // 6. Criar a matrícula
      const enrollment = Enrollment.create({
        userId: payment.userId,
        courseId: payment.courseId
      });

      const createdEnrollment = await this.enrollmentRepository.create(enrollment);

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
