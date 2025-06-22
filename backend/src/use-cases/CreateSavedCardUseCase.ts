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

    // Verificar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o cartão já está salvo (últimos 4 dígitos)
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

    // Se é o primeiro cartão, marcar como padrão
    const isFirstCard = existingCards.length === 0;
    const isDefault = request.isDefault || isFirstCard;

    // Criar dados do cartão
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
