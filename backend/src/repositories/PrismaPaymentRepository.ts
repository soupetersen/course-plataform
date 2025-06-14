import { PrismaClient } from '@prisma/client';
import { Payment, PaymentStatus, PaymentType } from '@/models/Payment';
import { PaymentRepository } from '@/interfaces/PaymentRepository';

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(payment: Payment): Promise<Payment> {
    const result = await this.prisma.payment.create({
      data: {
        id: payment.id,
        userId: payment.userId,
        courseId: payment.courseId,
        stripePaymentId: payment.stripePaymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status as any,
        paymentType: payment.paymentType as any,
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
  }

  async findByStripePaymentId(stripePaymentId: string): Promise<Payment | null> {
    const result = await this.prisma.payment.findUnique({
      where: { stripePaymentId },
    });

    return result ? this.toDomain(result) : null;
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

  private toDomain(payment: any): Payment {
    return new Payment(
      payment.id,
      payment.userId,
      payment.courseId,
      payment.stripePaymentId,
      payment.amount,
      payment.currency,
      payment.status as PaymentStatus,
      payment.paymentType as PaymentType,
      payment.createdAt,
      payment.updatedAt
    );
  }
}
