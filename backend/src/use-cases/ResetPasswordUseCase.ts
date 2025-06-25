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
      // Verificar se o código é válido
      const resetRecord = await this.passwordResetRepository.findByEmailAndCode(email, code);
      
      if (!resetRecord) {
        return {
          success: false,
          message: 'Código inválido ou expirado.'
        };
      }

      // Verificar se o usuário existe
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado.'
        };
      }

      // Validar a nova senha
      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'A senha deve ter pelo menos 8 caracteres.'
        };
      }

      // Criptografar a nova senha
      const hashedPassword = await this.passwordService.hashPassword(newPassword);

      // Atualizar a senha do usuário
      await this.userRepository.updatePassword(user.id, hashedPassword);

      // Marcar o código como usado
      await this.passwordResetRepository.markAsUsed(resetRecord.id);

      // Limpar outros códigos deste email
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
