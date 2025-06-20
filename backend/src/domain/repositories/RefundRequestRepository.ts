import { RefundRequest } from '../models/RefundRequest';

export interface RefundRequestRepository {
  create(refundRequest: RefundRequest): Promise<RefundRequest>;
  findById(id: string): Promise<RefundRequest | null>;
  findByPaymentId(paymentId: string): Promise<RefundRequest[]>;
  findByUserId(userId: string): Promise<RefundRequest[]>;
  findByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'): Promise<RefundRequest[]>;
  findPending(): Promise<RefundRequest[]>;
  findAll(): Promise<RefundRequest[]>;
  update(id: string, refundRequest: Partial<RefundRequest>): Promise<RefundRequest>;
  approve(id: string, notes?: string): Promise<RefundRequest>;
  reject(id: string, notes: string): Promise<RefundRequest>;
  markAsProcessed(id: string): Promise<RefundRequest>;
}
