export interface SavedCard {
  id: string;
  userId: string;
  cardHolderName: string;
  cardNumberLast4: string;
  cardBrand: string;
  expirationMonth: string;
  expirationYear: string;
  identificationType: string;
  identificationNumber: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSavedCardRequest {
  cardHolderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  identificationType: string;
  identificationNumber: string;
  isDefault?: boolean;
}

export interface UpdateSavedCardRequest {
  cardHolderName?: string;
  expirationMonth?: string;
  expirationYear?: string;
  identificationType?: string;
  identificationNumber?: string;
  isDefault?: boolean;
}
