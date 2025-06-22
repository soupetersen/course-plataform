import { randomUUID } from 'crypto';
import { Payment, PaymentStatus, PaymentType } from '@/models/Payment';
import { Subscription, SubscriptionStatus } from '@/models/Subscription';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { SubscriptionRepository } from '@/interfaces/SubscriptionRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { PaymentGatewayFactory } from '@/services/PaymentGatewayFactory';

export interface CreateSubscriptionPaymentRequest {
  userId: string;
  courseId: string;
  frequency?: number;
  frequencyType?: 'days' | 'weeks' | 'months' | 'years';
  gatewayType?: 'MERCADOPAGO' | 'STRIPE';
  cardToken?: string;
}

export interface CreateSubscriptionPaymentResponse {
  payment: Payment;
  subscription: Subscription;
  subscriptionData?: any;
}

export class CreateSubscriptionPaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private subscriptionRepository: SubscriptionRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository,
    private paymentGatewayFactory: PaymentGatewayFactory
  ) {}
  async execute(request: CreateSubscriptionPaymentRequest): Promise<CreateSubscriptionPaymentResponse> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error('Usuário não encontrado. Verifique se você está logado corretamente.');
    }

    const course = await this.courseRepository.findById(request.courseId);
    if (!course) {
      throw new Error('Curso não encontrado. O curso pode ter sido removido.');
    }

    if (!course.isPublished()) {
      throw new Error('Este curso não está disponível para assinatura no momento.');
    }

    // Verificar se já existe uma assinatura ativa para este curso
    const existingPayments = await this.paymentRepository.findByUserAndCourse(
      request.userId,
      request.courseId
    );
    
    for (const payment of existingPayments) {
      if (payment.isSubscription() && payment.isCompleted()) {
        const subscription = await this.subscriptionRepository.findByPaymentId(payment.id);
        if (subscription && subscription.isActive()) {
          throw new Error('Você já possui uma assinatura ativa para este curso.');
        }
      }
    }

    // Obter o gateway de pagamento
    const gatewayType = request.gatewayType || 'MERCADOPAGO';
    const gateway = this.paymentGatewayFactory.getGateway(gatewayType);
    
    if (!gateway.createSubscription) {
      throw new Error(`Gateway ${gatewayType} não suporta assinaturas recorrentes.`);
    }

    // Criar assinatura no gateway
    const subscriptionResult = await gateway.createSubscription({
      customerEmail: user.email,
      customerName: user.name,
      amount: course.price,
      currency: 'BRL',
      frequency: request.frequency || 1,
      frequencyType: request.frequencyType || 'months',
      description: `Assinatura do curso: ${course.title}`,
      cardToken: request.cardToken,
      metadata: {
        userId: request.userId,
        courseId: request.courseId,
        paymentType: PaymentType.SUBSCRIPTION,
      },
    });

    if (!subscriptionResult.success) {
      throw new Error(subscriptionResult.error || 'Não foi possível criar a assinatura.');
    }    // Criar pagamento no banco
    const payment = Payment.create(
      randomUUID(),
      request.userId,
      request.courseId,
      subscriptionResult.subscriptionId,
      course.price,
      'BRL',
      PaymentStatus.PENDING,
      PaymentType.SUBSCRIPTION,
      {
        gatewayProvider: gatewayType,
        paymentData: JSON.stringify(subscriptionResult.paymentData || {}),
      }
    );

    const savedPayment = await this.paymentRepository.create(payment);

    // Criar assinatura no banco
    const subscription = Subscription.create(
      randomUUID(),
      savedPayment.id,
      subscriptionResult.subscriptionId,
      user.id, // Usar o ID do usuário como customerId genérico
      SubscriptionStatus.INCOMPLETE,
      new Date(),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano por padrão
    );

    const savedSubscription = await this.subscriptionRepository.create(subscription);

    return {
      payment: savedPayment,
      subscription: savedSubscription,
      subscriptionData: subscriptionResult.paymentData,
    };
  }
}
