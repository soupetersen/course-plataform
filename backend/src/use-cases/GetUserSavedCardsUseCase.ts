import { SavedCard } from '../interfaces/SavedCard';
import { SavedCardRepository } from '../interfaces/SavedCardRepository';
import { UserRepository } from '../interfaces/UserRepository';

export class GetUserSavedCardsUseCase {
  constructor(
    private savedCardRepository: SavedCardRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<SavedCard[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return await this.savedCardRepository.findByUserId(userId);
  }
}
