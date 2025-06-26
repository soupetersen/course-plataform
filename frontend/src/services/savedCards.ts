import { api } from "@/lib/api";

export interface SavedCard {
  id: string;
  cardHolderName: string;
  cardNumberLast4: string;
  cardBrand: string;
  expirationMonth: string;
  expirationYear: string;
  identificationType: string;
  identificationNumber: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedCardRequest {
  cardHolderName: string;
  cardNumberLast4: string;
  cardBrand: string;
  expirationMonth: string;
  expirationYear: string;
  identificationType: string;
  identificationNumber: string;
  isDefault?: boolean;
}

export const savedCardsService = {
  async createSavedCard(cardData: CreateSavedCardRequest): Promise<SavedCard> {
    const response = await api.post("/api/saved-cards", cardData);
    return response.data.data;
  },

  async getUserSavedCards(): Promise<SavedCard[]> {
    const response = await api.get("/api/saved-cards");
    return response.data.data || [];
  },

  async deleteSavedCard(cardId: string): Promise<void> {
    await api.delete(`/api/saved-cards/${cardId}`);
  },

  async setDefaultSavedCard(cardId: string): Promise<SavedCard> {
    const response = await api.patch(`/api/saved-cards/${cardId}/default`);
    return response.data.data;
  },

  detectCardBrand(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, "");
    
    if (/^4/.test(cleanNumber)) return "visa";
    if (/^5[1-5]/.test(cleanNumber)) return "mastercard";
    if (/^3[47]/.test(cleanNumber)) return "amex";
    if (/^6/.test(cleanNumber)) return "discover";
    if (/^35/.test(cleanNumber)) return "jcb";
    if (/^30[0-5]/.test(cleanNumber)) return "diners";
    
    return "unknown";
  },

  formatCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, "");
    return cleanNumber.slice(-4);
  },

  formatExpirationDate(month: string, year: string): string {
    return `${month.padStart(2, "0")}/${year.slice(-2)}`;
  },

  isCardExpired(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const cardYear = parseInt(year);
    const cardMonth = parseInt(month);
    
    if (cardYear < currentYear) return true;
    if (cardYear === currentYear && cardMonth < currentMonth) return true;
    
    return false;
  }
};

