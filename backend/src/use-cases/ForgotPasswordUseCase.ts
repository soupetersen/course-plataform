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
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        return {
          success: true,
          message: 'Se o email existir em nossa base, você receberá um código de recuperação.'
        };
      }

      await this.passwordResetRepository.deleteByEmail(email);

      const code = this.generateResetCode();
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      await this.passwordResetRepository.create(email, code, expiresAt);

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
