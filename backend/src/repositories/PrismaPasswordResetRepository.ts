import { PasswordResetRepository, PasswordResetRecord } from '@/interfaces/PasswordResetRepository';
import { PrismaClient } from '@prisma/client';

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private prisma: PrismaClient) {}

  async create(email: string, code: string, expiresAt: Date): Promise<void> {
    await this.prisma.passwordReset.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });
  }

  async findByEmailAndCode(email: string, code: string): Promise<PasswordResetRecord | null> {
    const reset = await this.prisma.passwordReset.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return reset;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { id },
      data: { used: true },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.passwordReset.deleteMany({
      where: {
        OR: [
          { used: true },
          { expiresAt: { lt: new Date() } },
        ],
      },
    });
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.prisma.passwordReset.deleteMany({
      where: { email },
    });
  }
}
