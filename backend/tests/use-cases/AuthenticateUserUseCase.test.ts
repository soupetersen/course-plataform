import { AuthenticateUserUseCase, AuthenticateUserRequest } from '../../src/use-cases/AuthenticateUserUseCase';
import { UserRepository } from '../../src/interfaces/UserRepository';
import { PasswordService } from '../../src/services/PasswordService';
import { JwtService } from '../../src/services/JwtService';
import { User } from '../../src/models/User';

describe('AuthenticateUserUseCase', () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<UserRepository>;

    mockPasswordService = {
      hashPassword: jest.fn(),
      compare: jest.fn(),
      comparePassword: jest.fn(),
      validatePasswordStrength: jest.fn()
    } as unknown as jest.Mocked<PasswordService>;

    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      extractTokenFromHeader: jest.fn()
    } as unknown as jest.Mocked<JwtService>;

    authenticateUserUseCase = new AuthenticateUserUseCase(
      mockUserRepository,
      mockPasswordService,
      mockJwtService
    );
  });

  describe('execute', () => {
    const validCredentials: AuthenticateUserRequest = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockUser = User.create({
      name: 'John Doe',
      email: validCredentials.email,
      password: 'hashed_password',
      role: 'STUDENT'
    });

    it('should authenticate user successfully with object parameter', async () => {
      const mockToken = 'jwt_token';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authenticateUserUseCase.execute(validCredentials);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(mockPasswordService.compare).toHaveBeenCalledWith(validCredentials.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(result).toEqual({
        user: mockUser,
        token: mockToken
      });
    });

    it('should authenticate user successfully with separate parameters', async () => {
      const mockToken = 'jwt_token';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authenticateUserUseCase.execute(validCredentials.email, validCredentials.password);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(mockPasswordService.compare).toHaveBeenCalledWith(validCredentials.password, mockUser.password);
      expect(result).toEqual({
        user: mockUser,
        token: mockToken
      });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authenticateUserUseCase.execute(validCredentials)).rejects.toThrow('Invalid credentials');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(mockPasswordService.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw error if user account is deactivated', async () => {
      const inactiveUser = User.create({
        name: 'John Doe',
        email: validCredentials.email,
        password: 'hashed_password',
        role: 'STUDENT'
      });
      inactiveUser.isActive = false;

      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(authenticateUserUseCase.execute(validCredentials)).rejects.toThrow('User account is deactivated');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(mockPasswordService.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(false);

      await expect(authenticateUserUseCase.execute(validCredentials)).rejects.toThrow('Invalid credentials');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(mockPasswordService.compare).toHaveBeenCalledWith(validCredentials.password, mockUser.password);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle password service errors', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockRejectedValue(new Error('Password comparison failed'));

      await expect(authenticateUserUseCase.execute(validCredentials)).rejects.toThrow('Password comparison failed');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validCredentials.email);
      expect(mockPasswordService.compare).toHaveBeenCalledWith(validCredentials.password, mockUser.password);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });
});
