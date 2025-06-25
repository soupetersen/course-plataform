import { UserRepository } from '@/interfaces/UserRepository';
import { EmailService } from '@/services/EmailService';

export interface SendPasswordResetEmailRequest {
  email: string;
  resetToken: string;
}

export interface SendPasswordResetEmailResponse {
  success: boolean;
  error?: string;
}

export class SendPasswordResetEmailUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(request: SendPasswordResetEmailRequest): Promise<SendPasswordResetEmailResponse> {
    try {
      const { email, resetToken } = request;

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      await this.emailService.sendPasswordResetEmail(user.email, {
        userName: user.name,
        resetCode: resetToken,
        expirationTime: new Date(Date.now() + 60 * 60 * 1000),
      });

      console.log(`✅ Email de redefinição de senha enviado para ${user.email}`);

      return {
        success: true
      };

    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }
}
