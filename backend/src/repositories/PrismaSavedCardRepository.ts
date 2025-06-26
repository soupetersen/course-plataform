import { PrismaClient } from '@prisma/client';
import { SavedCardRepository } from '../interfaces/SavedCardRepository';
import { SavedCard, CreateSavedCardRequest, UpdateSavedCardRequest } from '../interfaces/SavedCard';

export class PrismaSavedCardRepository implements SavedCardRepository {
  constructor(private prisma: PrismaClient) {}

  private getCardBrand(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'discover';
    
    return 'unknown';
  }

  async create(userId: string, data: CreateSavedCardRequest): Promise<SavedCard> {
    const cleanCardNumber = data.cardNumber.replace(/\D/g, '');
    const cardBrand = this.getCardBrand(cleanCardNumber);
    const cardNumberLast4 = cleanCardNumber.slice(-4);

    if (data.isDefault) {
      await this.prisma.savedCard.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const savedCard = await this.prisma.savedCard.create({
      data: {
        userId,
        cardHolderName: data.cardHolderName,
        cardNumberLast4,
        cardBrand,
        expirationMonth: data.expirationMonth,
        expirationYear: data.expirationYear,
        identificationType: data.identificationType,
        identificationNumber: data.identificationNumber,
        isDefault: data.isDefault || false,
      }
    });

    return savedCard;
  }

  async findByUserId(userId: string): Promise<SavedCard[]> {
    return await this.prisma.savedCard.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findById(id: string): Promise<SavedCard | null> {
    return await this.prisma.savedCard.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: UpdateSavedCardRequest): Promise<SavedCard> {
    if (data.isDefault) {
      const card = await this.prisma.savedCard.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (card) {
        await this.prisma.savedCard.updateMany({
          where: { 
            userId: card.userId,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }
    }

    return await this.prisma.savedCard.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.savedCard.delete({
      where: { id }
    });
  }

  async setAsDefault(userId: string, cardId: string): Promise<void> {
    await this.prisma.savedCard.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    await this.prisma.savedCard.update({
      where: { id: cardId },
      data: { isDefault: true }
    });
  }
}
