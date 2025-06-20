import { PrismaClient } from '@prisma/client';
import { RefundRequestRepository } from '../../domain/repositories/RefundRequestRepository';
import { RefundRequest } from '../../domain/models/RefundRequest';

export class PrismaRefundRequestRepository implements RefundRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(refundRequest: RefundRequest): Promise<RefundRequest> {
    const created = await this.prisma.refundRequest.create({
      data: {
        paymentId: refundRequest.paymentId,
        userId: refundRequest.userId,
        reason: refundRequest.reason,
        amount: refundRequest.amount,
        status: refundRequest.status,
        notes: refundRequest.notes,
        processedAt: refundRequest.processedAt,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<RefundRequest | null> {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id },
    });

    return refund ? this.toDomain(refund) : null;
  }

  async findByPaymentId(paymentId: string): Promise<RefundRequest[]> {
    const refunds = await this.prisma.refundRequest.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });

    return refunds.map(this.toDomain);
  }

  async findByUserId(userId: string): Promise<RefundRequest[]> {
    const refunds = await this.prisma.refundRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return refunds.map(this.toDomain);
  }

  async findByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'): Promise<RefundRequest[]> {
    const refunds = await this.prisma.refundRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });

    return refunds.map(this.toDomain);
  }

  async findPending(): Promise<RefundRequest[]> {
    return this.findByStatus('PENDING');
  }

  async findAll(): Promise<RefundRequest[]> {
    const refunds = await this.prisma.refundRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return refunds.map(this.toDomain);
  }

  async update(id: string, data: Partial<RefundRequest>): Promise<RefundRequest> {
    const updated = await this.prisma.refundRequest.update({
      where: { id },
      data: {
        ...(data.reason && { reason: data.reason }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.processedAt !== undefined && { processedAt: data.processedAt }),
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async approve(id: string, notes?: string): Promise<RefundRequest> {
    const updated = await this.prisma.refundRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        notes: notes || null,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async reject(id: string, notes: string): Promise<RefundRequest> {
    const updated = await this.prisma.refundRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes,
        processedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async markAsProcessed(id: string): Promise<RefundRequest> {
    const updated = await this.prisma.refundRequest.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  private toDomain(prismaData: any): RefundRequest {
    return new RefundRequest(
      prismaData.id,
      prismaData.paymentId,
      prismaData.userId,
      prismaData.reason,
      prismaData.amount,
      prismaData.status,
      prismaData.stripeRefundId,
      prismaData.processedAt,
      prismaData.processedBy,
      prismaData.notes,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }
}
