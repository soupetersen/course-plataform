import { PrismaClient } from '@prisma/client';
import { MercadoPagoService } from './MercadoPagoService';
import { EmailService } from './EmailService';

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

interface InstructorBalance {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  nextPayoutDate?: Date;
}

export class InstructorPayoutService {
  constructor(
    private prisma: PrismaClient,
    private mercadoPagoService: MercadoPagoService,
    private emailService: EmailService
  ) {}

  /**
   * Atualizar dados de pagamento do instrutor
   */
  async updatePayoutData(instructorId: string, data: UpdatePayoutDataRequest) {
    if (!this.validateDocument(data.documentType, data.documentNumber)) {
      throw new Error('Documento inválido');
    }

    if (data.pixKey && !this.validatePixKey(data.pixKey)) {
      throw new Error('Chave PIX inválida');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: instructorId },
      data: {
        pixKey: data.pixKey,
        bankData: data.bankData as any,
        payoutPreference: data.payoutPreference as any,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        fullName: data.fullName,
        isVerified: false,
        verifiedAt: null
      }
    });

    console.log(`Solicitação de verificação enviada para instrutor: ${data.fullName} (${data.documentType}: ${data.documentNumber})`);

    return {
      id: updatedUser.id,
      isVerified: updatedUser.isVerified,
      payoutPreference: updatedUser.payoutPreference,
      hasPixKey: !!updatedUser.pixKey,
      hasBankData: !!updatedUser.bankData
    };
  }

  /**
   * Obter saldo do instrutor
   */
  async getInstructorBalance(instructorId: string): Promise<InstructorBalance> {
    // Buscar ou criar saldo do instrutor
    let balance = await this.prisma.instructorBalance.findUnique({
      where: { instructorId }
    });

    if (!balance) {
      balance = await this.prisma.instructorBalance.create({
        data: {
          instructorId,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0
        }
      });
    }

    // Calcular próxima data de liberação de saldo (30 dias após vendas)
    const nextPayoutDate = await this.calculateNextPayoutDate(instructorId);

    return {
      availableBalance: balance.availableBalance,
      pendingBalance: balance.pendingBalance,
      totalEarnings: balance.totalEarnings,
      totalWithdrawn: balance.totalWithdrawn,
      nextPayoutDate
    };
  }

  /**
   * Solicitar saque (máximo 1 por mês)
   */
  async requestPayout(instructorId: string, data: RequestPayoutRequest) {
    // Verificar se instrutor está verificado
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor?.isVerified) {
      throw new Error('Instrutor precisa ter dados verificados para solicitar saque');
    }

    // Verificar se já solicitou saque este mês
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const existingRequest = await this.prisma.payoutRequest.findFirst({
      where: {
        instructorId,
        requestMonth: currentMonth,
        requestYear: currentYear
      }
    });

    if (existingRequest) {
      throw new Error('Você já solicitou um saque este mês. Apenas um saque por mês é permitido.');
    }

    // Verificar saldo disponível
    const balance = await this.getInstructorBalance(instructorId);
    
    if (balance.availableBalance < data.amount) {
      throw new Error('Saldo insuficiente para saque');
    }

    // Valor mínimo de saque
    if (data.amount < 50) {
      throw new Error('Valor mínimo de saque é R$ 50,00');
    }

    // Preparar dados bancários
    let bankDetails: any = {};
    
    if (data.method === 'PIX') {
      if (!instructor.pixKey) {
        throw new Error('Chave PIX não cadastrada');
      }
      bankDetails = {
        method: 'PIX',
        pixKey: instructor.pixKey
      };
    } else {
      if (!instructor.bankData) {
        throw new Error('Dados bancários não cadastrados');
      }
      
      // Tratar bankData como Json
      const bankData = instructor.bankData as any;
      bankDetails = {
        method: 'BANK_TRANSFER',
        ...bankData
      };
    }

    // Criar solicitação de saque
    const payoutRequest = await this.prisma.payoutRequest.create({
      data: {
        instructorId,
        amount: data.amount,
        bankAccountType: data.method,
        bankDetails: bankDetails,
        status: 'PENDING',
        requestMonth: currentDate.getMonth() + 1,
        requestYear: currentDate.getFullYear()
      }
    });

    // Notificar admin sobre nova solicitação
    console.log(`Nova solicitação de payout: R$ ${data.amount} para ${instructor.name}`);

    return {
      id: payoutRequest.id,
      amount: payoutRequest.amount,
      status: payoutRequest.status,
      requestedAt: payoutRequest.requestedAt,
      estimatedProcessingTime: '2-5 dias úteis'
    };
  }

  /**
   * Creditar saldo do instrutor (chamado quando pagamento é aprovado)
   */
  async creditInstructorBalance(instructorId: string, amount: number, paymentId: string) {
    // Buscar ou criar saldo
    let balance = await this.prisma.instructorBalance.findUnique({
      where: { instructorId }
    });

    if (!balance) {
      balance = await this.prisma.instructorBalance.create({
        data: {
          instructorId,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0
        }
      });
    }

    // Atualizar saldo (vai para pendente por 30 dias)
    await this.prisma.instructorBalance.update({
      where: { instructorId },
      data: {
        pendingBalance: { increment: amount },
        totalEarnings: { increment: amount }
      }
    });

    // Registrar transação
    await this.prisma.balanceTransaction.create({
      data: {
        instructorId,
        type: 'CREDIT',
        amount,
        description: 'Venda de curso',
        paymentId
      }
    });

    console.log(`✅ Creditado R$ ${amount} para instrutor ${instructorId} (pendente)`);
  }

  /**
   * Liberar saldo pendente após 30 dias
   */
  async releaseExpiredPendingBalance() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Buscar transações de crédito com mais de 30 dias
    const expiredTransactions = await this.prisma.balanceTransaction.findMany({
      where: {
        type: 'CREDIT',
        createdAt: { lte: thirtyDaysAgo }
      },
      include: {
        instructorBalance: true
      }
    });

    for (const transaction of expiredTransactions) {
      await this.prisma.instructorBalance.update({
        where: { instructorId: transaction.instructorId },
        data: {
          availableBalance: { increment: transaction.amount },
          pendingBalance: { decrement: transaction.amount }
        }
      });
    }

    console.log(`✅ Liberado saldo de ${expiredTransactions.length} transações`);
  }

  /**
   * Histórico de saques do instrutor
   */
  async getPayoutHistory(instructorId: string) {
    return await this.prisma.payoutRequest.findMany({
      where: { instructorId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  /**
   * Histórico de transações do instrutor
   */
  async getTransactionHistory(instructorId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.balanceTransaction.findMany({
        where: { instructorId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          payment: {
            include: {
              course: { select: { title: true } }
            }
          }
        }
      }),
      this.prisma.balanceTransaction.count({
        where: { instructorId }
      })
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private validateDocument(type: string, number: string): boolean {
    if (type === 'CPF') {
      return /^[0-9]{11}$/.test(number.replace(/\D/g, ''));
    }
    if (type === 'CNPJ') {
      return /^[0-9]{14}$/.test(number.replace(/\D/g, ''));
    }
    return false;
  }

  private validatePixKey(pixKey: string): boolean {
    // Validação básica de chave PIX
    // CPF: 11 dígitos
    if (/^[0-9]{11}$/.test(pixKey.replace(/\D/g, ''))) return true;
    
    // CNPJ: 14 dígitos
    if (/^[0-9]{14}$/.test(pixKey.replace(/\D/g, ''))) return true;
    
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) return true;
    
    // Telefone
    if (/^\+55[1-9][0-9]{10}$/.test(pixKey.replace(/\D/g, ''))) return true;
    
    // Chave aleatória (36 caracteres)
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(pixKey)) return true;
    
    return false;
  }

  private async calculateNextPayoutDate(instructorId: string): Promise<Date | undefined> {
    const oldestPendingTransaction = await this.prisma.balanceTransaction.findFirst({
      where: {
        instructorId,
        type: 'CREDIT'
      },
      orderBy: { createdAt: 'asc' }
    });

    if (!oldestPendingTransaction) return undefined;

    const releaseDate = new Date(oldestPendingTransaction.createdAt);
    releaseDate.setDate(releaseDate.getDate() + 30);
    
    return releaseDate;
  }
}
