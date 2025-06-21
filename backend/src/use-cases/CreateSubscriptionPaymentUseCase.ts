import { randomUUID } from 'crypto';
import { Payment, PaymentStatus, PaymentType } from '@/models/Payment';
import { Subscription, SubscriptionStatus } from '@/models/Subscription';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { SubscriptionRepository } from '@/interfaces/SubscriptionRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { StripeService } from '@/services/StripeService';

export interface CreateSubscriptionPaymentRequest {
  userId: string;
  courseId: string;
}

export interface CreateSubscriptionPaymentResponse {
  payment: Payment;
  subscription: Subscription;
  clientSecret: string;
}

export class CreateSubscriptionPaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private subscriptionRepository: SubscriptionRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository,
    private stripeService: StripeService
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

    
    const customer = await this.stripeService.createCustomer({
      email: user.email,
      name: user.name,
    });

    
    const stripePriceId = 'price_subscription_example'; 

    
    const stripeSubscription = await this.stripeService.createSubscription({
      customerId: customer.id,
      priceId: stripePriceId,
      metadata: {
        userId: request.userId,
        courseId: request.courseId,
        paymentType: PaymentType.SUBSCRIPTION,
      },
    });

    
    const latestInvoice = stripeSubscription.latest_invoice as any;
    const paymentIntent = latestInvoice?.payment_intent;

    if (!paymentIntent) {
      throw new Error('Não foi possível processar o pagamento da assinatura. Tente novamente.');
    }

    
    const payment = Payment.create(
      randomUUID(),
      request.userId,
      request.courseId,
      paymentIntent.id,
      course.price,
      'usd',
      PaymentStatus.PENDING,
      PaymentType.SUBSCRIPTION
    );

    const savedPayment = await this.paymentRepository.create(payment);

    
    const subscription = Subscription.create(
      randomUUID(),
      savedPayment.id,
      stripeSubscription.id,
      customer.id,
      SubscriptionStatus.INCOMPLETE,
      new Date((stripeSubscription as any).current_period_start * 1000),
      new Date((stripeSubscription as any).current_period_end * 1000)
    );

    const savedSubscription = await this.subscriptionRepository.create(subscription);

    return {
      payment: savedPayment,
      subscription: savedSubscription,
      clientSecret: paymentIntent.client_secret!,
    };
  }
}
