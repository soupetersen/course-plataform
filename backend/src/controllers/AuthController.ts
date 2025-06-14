import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { CreateUserUseCase } from '@/use-cases/CreateUserUseCase';
import { AuthenticateUserUseCase } from '@/use-cases/AuthenticateUserUseCase';
import { CreateUserDto, LoginDto } from '@/dtos/UserDto';
import { UserRepository } from '@/interfaces/UserRepository';

export class AuthController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const createUserDto = request.body as CreateUserDto;
      
      const createUserUseCase = this.container.resolve<CreateUserUseCase>('CreateUserUseCase');
      const user = await createUserUseCase.execute(createUserDto);

      reply.status(201).send({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginDto = request.body as LoginDto;
      
      const authenticateUserUseCase = this.container.resolve<AuthenticateUserUseCase>('AuthenticateUserUseCase');
      const authResponse = await authenticateUserUseCase.execute(loginDto.email, loginDto.password);

      reply.send({
        success: true,
        data: authResponse
      });
    } catch (error) {
      reply.status(401).send({
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      
      const userRepository = this.container.resolve<UserRepository>('UserRepository');
      const user = await userRepository.findById(userInfo.userId);
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        });
      }

      reply.send({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user info'
      });
    }
  }
}
