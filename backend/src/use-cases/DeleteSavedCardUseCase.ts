import { SavedCardRepository } from '../interfaces/SavedCardRepository';
import { UserRepository } from '../interfaces/UserRepository';

export class DeleteSavedCardUseCase {
  constructor(
    private savedCardRepository: SavedCardRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string, cardId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const card = await this.savedCardRepository.findById(cardId);
    if (!card) {
      throw new Error('Cartão não encontrado');
    }

    if (card.userId !== userId) {
      throw new Error('Você não tem permissão para deletar este cartão');
    }

    if (card.isDefault) {
      const userCards = await this.savedCardRepository.findByUserId(userId);
      const otherCards = userCards.filter(c => c.id !== cardId);
      
      if (otherCards.length > 0) {
        await this.savedCardRepository.setAsDefault(userId, otherCards[0].id);
      }
    }

    await this.savedCardRepository.delete(cardId);
  }
}
