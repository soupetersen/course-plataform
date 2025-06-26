import { PasswordService } from '../../src/services/PasswordService';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const saltRounds = 10;

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await passwordService.hashPassword(password);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, saltRounds);
      expect(result).toBe(hashedPassword);
    });

    it('should use custom salt rounds from environment', async () => {
      const originalEnv = process.env.BCRYPT_SALT_ROUNDS;
      process.env.BCRYPT_SALT_ROUNDS = '12';

      const customPasswordService = new PasswordService();
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      await customPasswordService.hashPassword(password);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);

      process.env.BCRYPT_SALT_ROUNDS = originalEnv;
    });

    it('should handle bcrypt hash errors', async () => {
      const password = 'password123';
      const error = new Error('Hash failed');

      mockedBcrypt.hash.mockRejectedValue(error as never);

      await expect(passwordService.hashPassword(password)).rejects.toThrow('Hash failed');
    });
  });

  describe('compare', () => {
    it('should return true for valid password', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await passwordService.compare(password, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const password = 'wrongpassword';
      const hashedPassword = 'hashed_password';

      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await passwordService.compare(password, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle bcrypt compare errors', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const error = new Error('Compare failed');

      mockedBcrypt.compare.mockRejectedValue(error as never);

      await expect(passwordService.compare(password, hashedPassword)).rejects.toThrow('Compare failed');
    });
  });

  describe('comparePassword', () => {
    it('should call compare method', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await passwordService.comparePassword(password, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return true for valid strong password', () => {
      const validPasswords = [
        'Password123',
        'MyStr0ngPass',
        'Abc123!@#',
        'Valid1Password'
      ];

      validPasswords.forEach(password => {
        const result = passwordService.validatePasswordStrength(password);
        expect(result).toBe(true);
      });
    });

    it('should return false for weak passwords', () => {
      const weakPasswords = [
        'password',       
        'PASSWORD',        
        '12345678',        
        'Pass1',           
        'password123',     
        'PASSWORD123',   
        'PasswordABC',   
        ''               
      ];

      weakPasswords.forEach(password => {
        const result = passwordService.validatePasswordStrength(password);
        expect(result).toBe(false);
      });
    });

    it('should accept special characters', () => {
      const passwordsWithSpecialChars = [
        'Password123@',
        'MyStr0ng$Pass',
        'Abc123!!',
        'Valid1&Password'
      ];

      passwordsWithSpecialChars.forEach(password => {
        const result = passwordService.validatePasswordStrength(password);
        expect(result).toBe(true);
      });
    });
  });
});
