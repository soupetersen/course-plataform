import { PrismaClient } from '@prisma/client';
import { Payment, PaymentStatus, PaymentType } from '@/models/Payment';
import { PaymentRepository } from '@/interfaces/PaymentRepository';

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private prisma: PrismaClient) {}
  async create(payment: Payment): Promise<Payment> {
    const existingPayment = await this.prisma.payment.findUnique({
      where: { externalPaymentId: payment.externalPaymentId }
    });

    if (existingPayment) {
      console.log(`Payment with externalPaymentId ${payment.externalPaymentId} already exists, returning existing payment`);
      return this.toDomain(existingPayment);
    }

    const result = await this.prisma.payment.create({
      data: {
        id: payment.id,
        userId: payment.userId,
        courseId: payment.courseId,
        externalPaymentId: payment.externalPaymentId,
        externalOrderId: payment.externalOrderId,
        paymentData: payment.paymentData,
        paymentMethod: payment.paymentMethod,
        platformFeeAmount: payment.platformFeeAmount,
        instructorAmount: payment.instructorAmount,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status as any,
        paymentType: payment.paymentType as any,
        gatewayProvider: payment.gatewayProvider,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    });

    return this.toDomain(result);
  }

  async findById(id: string): Promise<Payment | null> {
    const result = await this.prisma.payment.findUnique({
      where: { id },
    });

    return result ? this.toDomain(result) : null;
  }  async findByExternalPaymentId(externalPaymentId: string): Promise<Payment | null> {
    const result = await this.prisma.payment.findFirst({
      where: { externalPaymentId },
    });

    return result ? this.toDomain(result) : null;
  }

  async findByStripePaymentId(stripePaymentId: string): Promise<Payment | null> {
    // Para compatibilidade, redirecionar para o método genérico
    return this.findByExternalPaymentId(stripePaymentId);
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const results = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return results.map(this.toDomain);
  }

  async findByCourseId(courseId: string): Promise<Payment[]> {
    const results = await this.prisma.payment.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });

    return results.map(this.toDomain);
  }
  async findByUserAndCourse(userId: string, courseId: string): Promise<Payment[]> {
    const results = await this.prisma.payment.findMany({
      where: { 
        userId,
        courseId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return results.map(this.toDomain);
  }

  async findPendingByCourseAndUser(courseId: string, userId: string): Promise<Payment | null> {
    const result = await this.prisma.payment.findFirst({
      where: { 
        userId,
        courseId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    return result ? this.toDomain(result) : null;
  }

  async update(payment: Payment): Promise<Payment> {
    const result = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: payment.status as any,
        updatedAt: payment.updatedAt,
      },
    });

    return this.toDomain(result);
  }
  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }

  async findPendingPayments(since: Date): Promise<Payment[]> {
    const results = await this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          gte: since
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });    return results.map(payment => this.toDomain(payment));
  }

  async findAll(filters?: { status?: string; page?: number; limit?: number }): Promise<Payment[]> {
    const { status, page = 1, limit = 20 } = filters || {};
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const results = await this.prisma.payment.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return results.map(payment => this.toDomain(payment));
  }

  private toDomain(payment: any): Payment {
    return new Payment(
      payment.id,
      payment.userId,
      payment.courseId,
      payment.externalPaymentId,
      payment.amount,
      payment.currency,
      payment.status as PaymentStatus,
      payment.paymentType as PaymentType,
      payment.createdAt,
      payment.updatedAt,
      payment.externalOrderId,
      payment.paymentData,
      payment.paymentMethod,
      payment.platformFeeAmount,
      payment.instructorAmount,
      payment.gatewayProvider
    );
  }
}
