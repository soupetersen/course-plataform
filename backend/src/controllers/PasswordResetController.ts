import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { ForgotPasswordUseCase } from '@/use-cases/ForgotPasswordUseCase';
import { ValidateResetCodeUseCase } from '@/use-cases/ValidateResetCodeUseCase';
import { ResetPasswordUseCase } from '@/use-cases/ResetPasswordUseCase';
import { ForgotPasswordDto, ValidateResetCodeDto, ResetPasswordDto } from '@/dtos/PasswordResetDto';

export class PasswordResetController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.body as ForgotPasswordDto;
      
      if (!email) {
        return reply.status(400).send({
          success: false,
          message: 'Email é obrigatório.'
        });
      }

      if (!email.includes('@')) {
        return reply.status(400).send({
          success: false,
          message: 'Email inválido.'
        });
      }

      const forgotPasswordUseCase = this.container.resolve<ForgotPasswordUseCase>('ForgotPasswordUseCase');
      const result = await forgotPasswordUseCase.execute(email);

      reply.send({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor.'
      });
    }
  }

  async validateResetCode(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, code } = request.body as ValidateResetCodeDto;
      
      if (!email || !code) {
        return reply.status(400).send({
          success: false,
          message: 'Email e código são obrigatórios.'
        });
      }

      if (!email.includes('@')) {
        return reply.status(400).send({
          success: false,
          message: 'Email inválido.'
        });
      }

      if (code.length !== 6) {
        return reply.status(400).send({
          success: false,
          message: 'Código deve ter 6 dígitos.'
        });
      }

      const validateResetCodeUseCase = this.container.resolve<ValidateResetCodeUseCase>('ValidateResetCodeUseCase');
      const result = await validateResetCodeUseCase.execute(email, code);

      reply.send({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor.'
      });
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, code, newPassword } = request.body as ResetPasswordDto;
      
      if (!email || !code || !newPassword) {
        return reply.status(400).send({
          success: false,
          message: 'Email, código e nova senha são obrigatórios.'
        });
      }

      if (!email.includes('@')) {
        return reply.status(400).send({
          success: false,
          message: 'Email inválido.'
        });
      }

      if (code.length !== 6) {
        return reply.status(400).send({
          success: false,
          message: 'Código deve ter 6 dígitos.'
        });
      }

      if (newPassword.length < 8) {
        return reply.status(400).send({
          success: false,
          message: 'A nova senha deve ter pelo menos 8 caracteres.'
        });
      }

      const resetPasswordUseCase = this.container.resolve<ResetPasswordUseCase>('ResetPasswordUseCase');
      const result = await resetPasswordUseCase.execute(email, code, newPassword);

      reply.send({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor.'
      });
    }
  }
}
