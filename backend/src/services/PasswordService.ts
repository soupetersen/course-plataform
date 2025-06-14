import bcrypt from 'bcrypt';

export class PasswordService {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return this.compare(password, hashedPassword);
  }

  validatePasswordStrength(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  }
}
