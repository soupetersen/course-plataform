import { UserRepository } from '@/interfaces/UserRepository';
import { PasswordResetRepository } from '@/interfaces/PasswordResetRepository';
import { EmailService } from '@/services/EmailService';

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordResetRepository: PasswordResetRepository,
    private emailService: EmailService
  ) {}

  async execute(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se o usuário existe
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        // Por segurança, não revelamos se o email existe ou não
        return {
          success: true,
          message: 'Se o email existir em nossa base, você receberá um código de recuperação.'
        };
      }

      // Limpar códigos anteriores para este email
      await this.passwordResetRepository.deleteByEmail(email);

      // Gerar código de 6 dígitos
      const code = this.generateResetCode();
      
      // Código expira em 15 minutos
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Salvar código no banco
      await this.passwordResetRepository.create(email, code, expiresAt);

      // Enviar email com o código
      await this.emailService.sendPasswordResetEmail(email, {
        userName: user.name,
        resetCode: code,
        expirationTime: expiresAt
      });

      return {
        success: true,
        message: 'Se o email existir em nossa base, você receberá um código de recuperação.'
      };
    } catch (error) {
      console.error('Erro no ForgotPasswordUseCase:', error);
      return {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      };
    }
  }

  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
