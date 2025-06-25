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

      // Buscar usuário pelo email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // Construir URL de redefinição
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      // Enviar email de redefinição
      await this.emailService.sendPasswordResetEmail(user.email, {
        userName: user.name,
        resetUrl,
        expirationTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
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
