import { randomUUID } from 'crypto';
import { Payment, PaymentStatus, PaymentType } from '@/models/Payment';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { SavedCardRepository } from '@/interfaces/SavedCardRepository';
import { PaymentGatewayFactory } from '@/services/PaymentGatewayFactory';

export interface CreateOneTimePaymentRequest {
  userId: string;
  courseId: string;
  currency: string;
  couponCode?: string;
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO';
  gatewayType?: 'MERCADOPAGO' | 'STRIPE' | 'PAGSEGURO';
  cardData?: {
    cardNumber?: string;
    cardHolderName?: string;
    expirationMonth?: string;
    expirationYear?: string;
    securityCode: string;
    installments?: number;
    identificationType?: string;
    identificationNumber?: string;
    saveCard?: boolean;
    savedCardId?: string; // ID do cartão salvo
  };
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
    private savedCardRepository: SavedCardRepository,
    private paymentGatewayFactory: PaymentGatewayFactory
  ) {}

  async execute(request: CreateOneTimePaymentRequest): Promise<CreateOneTimePaymentResponse> {
    const { userId, courseId, currency, couponCode, paymentMethod = 'PIX', gatewayType, cardData } = request;

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

    // Determinar URLs
    const returnUrl = `${process.env.FRONTEND_URL}/courses/${courseId}?payment=success`;

    console.log('Return URL para MercadoPago:', returnUrl);

    // Processar dados do cartão (novo ou salvo)
    let finalCardData: any = undefined;
    
    if (cardData && paymentMethod === 'CREDIT_CARD') {
      if (cardData.savedCardId) {
        // Usar cartão salvo
        const savedCard = await this.savedCardRepository.findById(cardData.savedCardId);
        if (!savedCard) {
          throw new Error('Cartão salvo não encontrado.');
        }
        
        if (savedCard.userId !== userId) {
          throw new Error('Cartão não pertence ao usuário.');
        }
        
        finalCardData = {
          cardNumber: `****${savedCard.cardNumberLast4}`, // Placeholder para cartão salvo
          cardHolderName: savedCard.cardHolderName,
          expirationMonth: savedCard.expirationMonth,
          expirationYear: savedCard.expirationYear,
          securityCode: cardData.securityCode,
          installments: cardData.installments || 1,
          identificationType: savedCard.identificationType,
          identificationNumber: savedCard.identificationNumber,
        };
      } else if (cardData.cardNumber) {
        // Usar novo cartão
        finalCardData = {
          cardNumber: cardData.cardNumber,
          cardHolderName: cardData.cardHolderName!,
          expirationMonth: cardData.expirationMonth!,
          expirationYear: cardData.expirationYear!,
          securityCode: cardData.securityCode,
          installments: cardData.installments || 1,
          identificationType: cardData.identificationType,
          identificationNumber: cardData.identificationNumber,
        };
      } else {
        throw new Error('Dados do cartão são obrigatórios para pagamento com cartão de crédito.');
      }
    }

    // Criar pagamento no gateway
    const gatewayRequest = {
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
      returnUrl: returnUrl,
      ...(finalCardData && { cardData: finalCardData })
    };

    const gatewayResponse = await gateway.createPayment(gatewayRequest);

    if (!gatewayResponse.success) {
      throw new Error(gatewayResponse.error || 'Falha ao criar pagamento');
    }

    console.log('Gateway response received:', { 
      paymentId: gatewayResponse.paymentId, 
      orderId: gatewayResponse.orderId 
    });

    // Verificar se já existe um pagamento com este externalPaymentId
    const existingPayment = await this.paymentRepository.findByExternalPaymentId(gatewayResponse.paymentId);
    if (existingPayment) {
      console.log('Payment already exists, returning existing payment:', existingPayment.id);
      return {
        payment: existingPayment,
        paymentData: gatewayResponse.paymentData,
      };
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

    console.log('Creating new payment:', payment.id);
    const savedPayment = await this.paymentRepository.create(payment);

    // Salvar cartão se solicitado (apenas para novos cartões)
    if (cardData && cardData.saveCard && cardData.cardNumber && !cardData.savedCardId) {
      try {
        await this.savedCardRepository.create(userId, {
          cardHolderName: cardData.cardHolderName!,
          cardNumber: cardData.cardNumber,
          expirationMonth: cardData.expirationMonth!,
          expirationYear: cardData.expirationYear!,
          identificationType: cardData.identificationType || 'CPF',
          identificationNumber: cardData.identificationNumber || '',
          isDefault: false,
        });
        
        console.log('Card saved successfully for user:', userId);
      } catch (error) {
        console.error('Error saving card:', error);
        // Não falhar o pagamento se não conseguir salvar o cartão
      }
    }

    return {
      payment: savedPayment,
      paymentData: gatewayResponse.paymentData,
    };
  }

  private detectCardBrand(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, "");
    
    if (/^4/.test(cleanNumber)) return "visa";
    if (/^5[1-5]/.test(cleanNumber)) return "mastercard";
    if (/^3[47]/.test(cleanNumber)) return "amex";
    if (/^6/.test(cleanNumber)) return "discover";
    if (/^35/.test(cleanNumber)) return "jcb";
    if (/^30[0-5]/.test(cleanNumber)) return "diners";
    
    return "unknown";
  }
}
