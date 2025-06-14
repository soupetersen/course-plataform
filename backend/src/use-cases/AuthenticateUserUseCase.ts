import { UserEntity } from '@/models/User';
import { PasswordService } from '@/services/PasswordService';
import { JwtService } from '@/services/JwtService';
import { UserRepository } from '@/interfaces/UserRepository';

export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export interface AuthenticateUserResponse {
  user: UserEntity;
  token: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private jwtService: JwtService
  ) {}

  async execute(data: AuthenticateUserRequest): Promise<AuthenticateUserResponse>;
  async execute(email: string, password: string): Promise<AuthenticateUserResponse>;
  async execute(dataOrEmail: AuthenticateUserRequest | string, password?: string): Promise<AuthenticateUserResponse> {
    const data = typeof dataOrEmail === 'string' 
      ? { email: dataOrEmail, password: password! }
      : dataOrEmail;

    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }
    const isPasswordValid = await this.passwordService.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    return {
      user,
      token
    };
  }
}
