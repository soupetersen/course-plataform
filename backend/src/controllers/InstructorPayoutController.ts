import { FastifyRequest, FastifyReply } from 'fastify';
import { InstructorPayoutService } from '@/services/InstructorPayoutService';
import { PayoutMethod } from '@prisma/client';

interface UpdatePayoutDataRequest {
  pixKey?: string;
  bankData?: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'CORRENTE' | 'POUPANCA';
    accountHolder: string;
  };
  payoutPreference: 'PIX' | 'BANK_TRANSFER';
  documentType: 'CPF' | 'CNPJ';
  documentNumber: string;
  fullName: string;
}

interface RequestPayoutRequest {
  amount: number;
  method: 'PIX' | 'BANK_TRANSFER';
  bankData?: any;
}

export class InstructorPayoutController {
  constructor(
    private instructorPayoutService: InstructorPayoutService
  ) {}

  /**
   * Atualizar dados de pagamento do instrutor
   */
  async updatePayoutData(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;
      const data = req.body as UpdatePayoutDataRequest;

      if (userInfo.role !== 'INSTRUCTOR') {
        return reply.status(403).send({
          success: false,
          error: 'Apenas instrutores podem configurar dados de pagamento'
        });
      }

      const result = await this.instructorPayoutService.updatePayoutData(userInfo.id, data);

      reply.send({
        success: true,
        data: result,
        message: 'Dados de pagamento atualizados com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar dados de pagamento:', error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter saldo atual do instrutor
   */
  async getBalance(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;

      if (userInfo.role !== 'INSTRUCTOR') {
        return reply.status(403).send({
          success: false,
          error: 'Apenas instrutores podem ver o saldo'
        });
      }

      const balance = await this.instructorPayoutService.getInstructorBalance(userInfo.id);

      reply.send({
        success: true,
        data: balance
      });
    } catch (error: any) {
      console.error('Erro ao buscar saldo:', error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Solicitar saque
   */
  async requestPayout(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;
      const data = req.body as RequestPayoutRequest;

      if (userInfo.role !== 'INSTRUCTOR') {
        return reply.status(403).send({
          success: false,
          error: 'Apenas instrutores podem solicitar saques'
        });
      }

      const result = await this.instructorPayoutService.requestPayout(userInfo.id, data);

      reply.send({
        success: true,
        data: result,
        message: 'Solicitação de saque criada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao solicitar saque:', error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar histórico de saques
   */
  async getPayoutHistory(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;

      if (userInfo.role !== 'INSTRUCTOR') {
        return reply.status(403).send({
          success: false,
          error: 'Apenas instrutores podem ver histórico de saques'
        });
      }

      const history = await this.instructorPayoutService.getPayoutHistory(userInfo.id);

      reply.send({
        success: true,
        data: history
      });
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter extrato de transações
   */
  async getTransactionHistory(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;
      const { page = 1, limit = 20 } = req.query as any;

      if (userInfo.role !== 'INSTRUCTOR') {
        return reply.status(403).send({
          success: false,
          error: 'Apenas instrutores podem ver extrato'
        });
      }

      const history = await this.instructorPayoutService.getTransactionHistory(
        userInfo.id,
        parseInt(page),
        parseInt(limit)
      );

      reply.send({
        success: true,
        data: history
      });
    } catch (error: any) {
      console.error('Erro ao buscar extrato:', error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }
}
