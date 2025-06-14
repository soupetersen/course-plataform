import { randomUUID } from 'crypto';
import { Payment, PaymentStatus, PaymentType } from '@/models/Payment';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { StripeService } from '@/services/StripeService';

export interface CreateOneTimePaymentRequest {
  userId: string;
  courseId: string;
  currency?: string;
}

export interface CreateOneTimePaymentResponse {
  payment: Payment;
  clientSecret: string;
}

export class CreateOneTimePaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository,
    private stripeService: StripeService
  ) {}

  async execute(request: CreateOneTimePaymentRequest): Promise<CreateOneTimePaymentResponse> {
    
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error('User not found');
    }

    
    const course = await this.courseRepository.findById(request.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    if (!course.isPublished()) {
      throw new Error('Course is not published');
    }

    
    
    

    
    const existingPayments = await this.paymentRepository.findByUserAndCourse(
      request.userId,
      request.courseId
    );
    
    const hasCompletedPayment = existingPayments.some(payment => payment.isCompleted());
    if (hasCompletedPayment) {
      throw new Error('User has already purchased this course');
    }

    
    const customer = await this.stripeService.createCustomer({
      email: user.email,
      name: user.name,
    });

    
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: course.price,
      currency: request.currency || 'usd',
      customerId: customer.id,
      metadata: {
        userId: request.userId,
        courseId: request.courseId,
        paymentType: PaymentType.ONE_TIME,
      },
    });

    
    const payment = Payment.create(
      randomUUID(),
      request.userId,
      request.courseId,
      paymentIntent.id,
      course.price,
      request.currency || 'usd',
      PaymentStatus.PENDING,
      PaymentType.ONE_TIME
    );

    const savedPayment = await this.paymentRepository.create(payment);

    return {
      payment: savedPayment,
      clientSecret: paymentIntent.client_secret!,
    };
  }
}
