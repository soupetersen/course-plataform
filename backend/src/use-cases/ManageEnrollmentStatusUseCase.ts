import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { Enrollment } from '@/models/Enrollment';
import { PaymentStatus, PaymentType } from '@/models/Payment';

export interface ManageEnrollmentStatusRequest {
  paymentId: string;
  newStatus: PaymentStatus;
}

export interface ManageEnrollmentStatusResponse {
  success: boolean;
  enrollment?: Enrollment;
  action?: 'paused' | 'resumed' | 'no_action' | 'enrolled';
  error?: string;
}

export class ManageEnrollmentStatusUseCase {
  constructor(
    private enrollmentRepository: EnrollmentRepository,
    private paymentRepository: PaymentRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: ManageEnrollmentStatusRequest): Promise<ManageEnrollmentStatusResponse> {
    try {
      // 1. Buscar o pagamento
      const payment = await this.paymentRepository.findById(request.paymentId);
      if (!payment) {
        return {
          success: false,
          error: 'Pagamento não encontrado'
        };
      }

      // 2. Verificar se é um pagamento recorrente (subscription)
      const isSubscription = payment.paymentType === PaymentType.SUBSCRIPTION;

      // 3. Buscar matrícula existente
      const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(
        payment.userId,
        payment.courseId
      );

      // 4. Lógica baseada no status do pagamento
      switch (request.newStatus) {
        case PaymentStatus.COMPLETED:
          return await this.handleApprovedPayment(payment, existingEnrollment, isSubscription);
        
        case PaymentStatus.FAILED:
        case PaymentStatus.CANCELLED:
          return await this.handleFailedPayment(payment, existingEnrollment, isSubscription);
        
        case PaymentStatus.REFUNDED:
          return await this.handleRefundedPayment(payment, existingEnrollment, isSubscription);
        
        default:
          return {
            success: true,
            action: 'no_action'
          };
      }

    } catch (error) {
      console.error('Erro ao gerenciar status da matrícula:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  private async handleApprovedPayment(
    payment: any,
    existingEnrollment: Enrollment | null,
    isSubscription: boolean
  ): Promise<ManageEnrollmentStatusResponse> {
    
    if (!existingEnrollment) {
      // Criar nova matrícula
      const enrollment = Enrollment.create({
        userId: payment.userId,
        courseId: payment.courseId
      });

      const createdEnrollment = await this.enrollmentRepository.create(enrollment);
      
      return {
        success: true,
        enrollment: createdEnrollment,
        action: 'enrolled'
      };
    } else {
      // Se matrícula existe mas está pausada, reativar
      if (!existingEnrollment.isActive) {
        existingEnrollment.reactivate();
        const updatedEnrollment = await this.enrollmentRepository.update(
          existingEnrollment.id,
          existingEnrollment
        );
        
        return {
          success: true,
          enrollment: updatedEnrollment,
          action: 'resumed'
        };
      }
      
      return {
        success: true,
        enrollment: existingEnrollment,
        action: 'no_action'
      };
    }
  }

  private async handleFailedPayment(
    payment: any,
    existingEnrollment: Enrollment | null,
    isSubscription: boolean
  ): Promise<ManageEnrollmentStatusResponse> {
    
    if (!existingEnrollment) {
      return {
        success: true,
        action: 'no_action'
      };
    }

    // Para assinaturas, pausar a matrícula em vez de remover
    if (isSubscription && existingEnrollment.isActive) {
      existingEnrollment.deactivate();
      const updatedEnrollment = await this.enrollmentRepository.update(
        existingEnrollment.id,
        existingEnrollment
      );
      
      return {
        success: true,
        enrollment: updatedEnrollment,
        action: 'paused'
      };
    }

    return {
      success: true,
      enrollment: existingEnrollment,
      action: 'no_action'
    };
  }

  private async handleRefundedPayment(
    payment: any,
    existingEnrollment: Enrollment | null,
    isSubscription: boolean
  ): Promise<ManageEnrollmentStatusResponse> {
    
    if (!existingEnrollment) {
      return {
        success: true,
        action: 'no_action'
      };
    }

    // Para reembolsos, sempre pausar/desativar a matrícula
    if (existingEnrollment.isActive) {
      existingEnrollment.deactivate();
      const updatedEnrollment = await this.enrollmentRepository.update(
        existingEnrollment.id,
        existingEnrollment
      );
      
      return {
        success: true,
        enrollment: updatedEnrollment,
        action: 'paused'
      };
    }

    return {
      success: true,
      enrollment: existingEnrollment,
      action: 'no_action'
    };
  }
}
