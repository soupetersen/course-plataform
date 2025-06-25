import { PasswordResetRepository } from '@/interfaces/PasswordResetRepository';

export class ValidateResetCodeUseCase {
  constructor(
    private passwordResetRepository: PasswordResetRepository
  ) {}

  async execute(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const resetRecord = await this.passwordResetRepository.findByEmailAndCode(email, code);
      
      if (!resetRecord) {
        return {
          success: false,
          message: 'Código inválido ou expirado.'
        };
      }

      return {
        success: true,
        message: 'Código válido.'
      };
    } catch (error) {
      console.error('Erro no ValidateResetCodeUseCase:', error);
      return {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      };
    }
  }
}
