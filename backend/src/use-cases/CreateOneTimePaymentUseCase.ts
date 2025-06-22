import { randomUUID } from 'crypto';
import { Payment, PaymentStatus, PaymentType } from '@/models/Payment';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { PaymentGatewayFactory } from '@/services/PaymentGatewayFactory';

export interface CreateOneTimePaymentRequest {
  userId: string;
  courseId: string;
  currency: string;
  couponCode?: string;
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO';
  gatewayType?: 'MERCADOPAGO' | 'STRIPE' | 'PAGSEGURO';
}

export interface CreateOneTimePaymentResponse {
  payment: Payment;
  paymentData?: {
    pixQrCode?: string;
    pixCopiaECola?: string;
    checkoutUrl?: string;
    boletoUrl?: string;
    [key: string]: any;
  };
}

export class CreateOneTimePaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository,
    private paymentGatewayFactory: PaymentGatewayFactory
  ) {}

  async execute(request: CreateOneTimePaymentRequest): Promise<CreateOneTimePaymentResponse> {
    const { userId, courseId, currency, couponCode, paymentMethod = 'PIX', gatewayType } = request;

    // Validar usuário
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado. Verifique se você está logado corretamente.');
    }

    // Validar curso
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Curso não encontrado. O curso pode ter sido removido.');
    }

    if (!course.isPublished()) {
      throw new Error('Este curso não está disponível para compra no momento.');
    }

    // Verificar se já tem pagamento bem-sucedido para este curso
    const existingPayments = await this.paymentRepository.findByUserAndCourse(userId, courseId);
    const hasCompletedPayment = existingPayments.some(payment => 
      payment.status === PaymentStatus.COMPLETED && payment.paymentType === PaymentType.ONE_TIME
    );

    if (hasCompletedPayment) {
      throw new Error('Você já possui este curso.');
    }

    // Buscar instrutor do curso
    const instructor = await this.userRepository.findById(course.instructorId);
    if (!instructor) {
      throw new Error('Instrutor do curso não encontrado.');
    }

    // Obter gateway de pagamento - forçar MERCADOPAGO se não especificado
    const finalGatewayType = gatewayType || 'MERCADOPAGO';
    // Forçar currency para BRL
    const finalCurrency = 'BRL';
    console.log('Using gateway type:', finalGatewayType);
    console.log('Using currency:', finalCurrency);
    const gateway = this.paymentGatewayFactory.getGateway(finalGatewayType as any);
    
    const amount = course.price;
    
    // Calcular taxas
    const platformFeePercentage = 10; // 10% para a plataforma
    const platformFeeAmount = (amount * platformFeePercentage) / 100;
    const instructorAmount = amount - platformFeeAmount;

    // Determinar a notification URL - usar ngrok se disponível para desenvolvimento
    const baseUrl = process.env.NGROK_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    const notificationUrl = `${baseUrl}/api/payments/webhook`;
    const returnUrl = `${process.env.FRONTEND_URL}/courses/${courseId}?payment=success`;

    console.log('Notification URL para MercadoPago:', notificationUrl);
    console.log('Return URL para MercadoPago:', returnUrl);

    // Criar pagamento no gateway
    const gatewayResponse = await gateway.createPayment({
      amount: amount,
      currency: finalCurrency,
      customerEmail: user.email,
      customerName: user.name,
      description: `Curso: ${course.title}`,
      paymentMethod: paymentMethod,
      metadata: {
        userId: userId,
        courseId: courseId,
        instructorId: instructor.id,
        paymentType: PaymentType.ONE_TIME,
        platformFeeAmount: platformFeeAmount.toString(),
        instructorAmount: instructorAmount.toString(),
        ...(couponCode && { couponCode })
      },
      notificationUrl: notificationUrl,
      returnUrl: returnUrl
    });

    if (!gatewayResponse.success) {
      throw new Error(gatewayResponse.error || 'Falha ao criar pagamento');
    }

    // Criar pagamento no banco de dados
    const payment = Payment.create(
      randomUUID(),
      userId,
      courseId,
      gatewayResponse.paymentId,
      amount,
      finalCurrency,
      PaymentStatus.PENDING,
      PaymentType.ONE_TIME,
      {
        externalOrderId: gatewayResponse.orderId,
        paymentData: JSON.stringify(gatewayResponse.paymentData || {}),
        paymentMethod: paymentMethod,
        platformFeeAmount: platformFeeAmount,
        instructorAmount: instructorAmount,
        gatewayProvider: gateway.name
      }
    );

    const savedPayment = await this.paymentRepository.create(payment);

    return {
      payment: savedPayment,
      paymentData: gatewayResponse.paymentData,
    };
  }
}
