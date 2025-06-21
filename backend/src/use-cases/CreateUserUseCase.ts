import { User } from '@/models/User';
import { UserRepository } from '@/interfaces/UserRepository';
import { CreateUserDto } from '@/dtos/UserDto';
import { PasswordService } from '@/services/PasswordService';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService
  ) {}

  async execute(data: CreateUserDto): Promise<User> {    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Já existe uma conta cadastrada com este email. Tente fazer login ou use outro email.');
    }

    const hashedPassword = await this.passwordService.hashPassword(data.password);

    const user = User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: (data.role as any) || 'STUDENT'
    });

    const savedUser = await this.userRepository.create(user);
    return savedUser;
  }
}
