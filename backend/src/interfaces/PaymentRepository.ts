import { Payment } from '@/models/Payment';

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByExternalPaymentId(externalPaymentId: string): Promise<Payment | null>; 
  findByStripePaymentId(stripePaymentId: string): Promise<Payment | null>;
  findByUserId(userId: string): Promise<Payment[]>;
  findByCourseId(courseId: string): Promise<Payment[]>;  
  findByUserAndCourse(userId: string, courseId: string): Promise<Payment[]>;
  findPendingByCourseAndUser(courseId: string, userId: string): Promise<Payment | null>;
  findAll(filters?: { status?: string; page?: number; limit?: number }): Promise<Payment[]>;
  update(payment: Payment): Promise<Payment>;
  delete(id: string): Promise<void>;
}
