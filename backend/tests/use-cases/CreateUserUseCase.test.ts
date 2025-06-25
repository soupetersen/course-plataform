import { CreateUserUseCase } from '../../src/use-cases/CreateUserUseCase';
import { UserRepository } from '../../src/interfaces/UserRepository';
import { PasswordService } from '../../src/services/PasswordService';
import { User } from '../../src/models/User';
import { CreateUserDto } from '../../src/dtos/UserDto';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;

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

    createUserUseCase = new CreateUserUseCase(mockUserRepository, mockPasswordService);
  });

  describe('execute', () => {
    const validUserData: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashed_password';
      const createdUser = User.create({
        ...validUserData,
        password: hashedPassword,
        role: 'STUDENT'
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await createUserUseCase.execute(validUserData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(validUserData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validUserData.name,
          email: validUserData.email,
          password: hashedPassword,
          role: 'STUDENT'
        })
      );
      expect(result).toBe(createdUser);
    });

    it('should throw error if user already exists', async () => {
      const existingUser = User.create({
        ...validUserData,
        password: 'existing_password',
        role: 'STUDENT'
      });

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(createUserUseCase.execute(validUserData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should handle password hashing errors', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockRejectedValue(new Error('Hashing failed'));

      await expect(createUserUseCase.execute(validUserData)).rejects.toThrow('Hashing failed');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(validUserData.password);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository creation errors', async () => {
      const hashedPassword = 'hashed_password';

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(createUserUseCase.execute(validUserData)).rejects.toThrow('Database error');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(validUserData.password);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });
  });
});
