import { SavedCard, CreateSavedCardRequest } from '../interfaces/SavedCard';
import { SavedCardRepository } from '../interfaces/SavedCardRepository';
import { UserRepository } from '../interfaces/UserRepository';

export interface CreateSavedCardUseCaseRequest {
  userId: string;
  cardHolderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  identificationType: string;
  identificationNumber: string;
  isDefault?: boolean;
}

export class CreateSavedCardUseCase {
  constructor(
    private savedCardRepository: SavedCardRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateSavedCardUseCaseRequest): Promise<SavedCard> {
    const { userId, cardNumber, ...cardData } = request;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const cardNumberLast4 = cardNumber.replace(/\D/g, '').slice(-4);
    const existingCards = await this.savedCardRepository.findByUserId(userId);
    
    const cardExists = existingCards.some(card => 
      card.cardNumberLast4 === cardNumberLast4 &&
      card.expirationMonth === cardData.expirationMonth &&
      card.expirationYear === cardData.expirationYear
    );

    if (cardExists) {
      throw new Error('Este cartão já está salvo');
    }

    const isFirstCard = existingCards.length === 0;
    const isDefault = request.isDefault || isFirstCard;

    const createCardData: CreateSavedCardRequest = {
      cardHolderName: cardData.cardHolderName,
      cardNumber: cardNumber,
      expirationMonth: cardData.expirationMonth,
      expirationYear: cardData.expirationYear,
      identificationType: cardData.identificationType,
      identificationNumber: cardData.identificationNumber,
      isDefault,
    };

    return await this.savedCardRepository.create(userId, createCardData);
  }
}
