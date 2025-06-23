import { RefundRequest } from '../models/RefundRequest';

export interface RefundRequestRepository {
  create(refundRequest: RefundRequest): Promise<RefundRequest>;
  findById(id: string): Promise<RefundRequest | null>;
  findByPaymentId(paymentId: string): Promise<RefundRequest[]>;
  findByUserId(userId: string): Promise<RefundRequest[]>;
  update(id: string, data: Partial<RefundRequest>): Promise<RefundRequest>;
  delete(id: string): Promise<void>;
  findAll(): Promise<RefundRequest[]>;
}
