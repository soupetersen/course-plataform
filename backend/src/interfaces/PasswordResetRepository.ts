export interface PasswordResetRepository {
  create(email: string, code: string, expiresAt: Date): Promise<void>;
  findByEmailAndCode(email: string, code: string): Promise<PasswordResetRecord | null>;
  markAsUsed(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
  deleteByEmail(email: string): Promise<void>;
}

export interface PasswordResetRecord {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}
