import { UserRepository } from '@/interfaces/UserRepository';
import { PasswordResetRepository } from '@/interfaces/PasswordResetRepository';
import { PasswordService } from '@/services/PasswordService';

export class ResetPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordResetRepository: PasswordResetRepository,
    private passwordService: PasswordService
  ) {}

  async execute(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const resetRecord = await this.passwordResetRepository.findByEmailAndCode(email, code);
      
      if (!resetRecord) {
        return {
          success: false,
          message: 'Código inválido ou expirado.'
        };
      }

      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado.'
        };
      }

      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'A senha deve ter pelo menos 8 caracteres.'
        };
      }

      const hashedPassword = await this.passwordService.hashPassword(newPassword);

      await this.userRepository.updatePassword(user.id, hashedPassword);

      await this.passwordResetRepository.markAsUsed(resetRecord.id);

      await this.passwordResetRepository.deleteByEmail(email);

      return {
        success: true,
        message: 'Senha atualizada com sucesso.'
      };
    } catch (error) {
      console.error('Erro no ResetPasswordUseCase:', error);
      return {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      };
    }
  }
}
