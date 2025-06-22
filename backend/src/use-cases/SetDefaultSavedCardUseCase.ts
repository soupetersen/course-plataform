import { SavedCard } from '../interfaces/SavedCard';
import { SavedCardRepository } from '../interfaces/SavedCardRepository';
import { UserRepository } from '../interfaces/UserRepository';

export class SetDefaultSavedCardUseCase {
  constructor(
    private savedCardRepository: SavedCardRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string, cardId: string): Promise<SavedCard> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o cartão existe e pertence ao usuário
    const card = await this.savedCardRepository.findById(cardId);
    if (!card) {
      throw new Error('Cartão não encontrado');
    }

    if (card.userId !== userId) {
      throw new Error('Você não tem permissão para alterar este cartão');
    }

    // Definir como padrão
    await this.savedCardRepository.setAsDefault(userId, cardId);

    // Retornar o cartão atualizado
    const updatedCard = await this.savedCardRepository.findById(cardId);
    return updatedCard!;
  }
}
