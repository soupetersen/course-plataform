import { SavedCard, CreateSavedCardRequest, UpdateSavedCardRequest } from '../interfaces/SavedCard';

export interface SavedCardRepository {
  create(userId: string, data: CreateSavedCardRequest): Promise<SavedCard>;
  findByUserId(userId: string): Promise<SavedCard[]>;
  findById(id: string): Promise<SavedCard | null>;
  update(id: string, data: UpdateSavedCardRequest): Promise<SavedCard>;
  delete(id: string): Promise<void>;
  setAsDefault(userId: string, cardId: string): Promise<void>;
}
