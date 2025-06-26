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
        }      });    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Falha no registro. Tente novamente.'
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
      });    } catch (error) {
      reply.status(401).send({
        success: false,
        message: error instanceof Error ? error.message : 'Falha na autenticação. Verifique suas credenciais.'
      });
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
        if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'Acesso não autorizado. Faça login novamente.'
        });
      }

      
      const userRepository = this.container.resolve<UserRepository>('UserRepository');
      const user = await userRepository.findById(userInfo.userId);
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Usuário não encontrado. Entre em contato com o suporte.'
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
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor. Tente novamente mais tarde.'
      });
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'Acesso não autorizado. Faça login novamente.'
        });
      }

      const { name, avatar } = request.body as { name?: string; avatar?: string };
      
      if (!name && !avatar) {
        return reply.status(400).send({
          success: false,
          message: 'Pelo menos um campo deve ser fornecido para atualização.'
        });
      }

      const userRepository = this.container.resolve<UserRepository>('UserRepository');
      
      const existingUser = await userRepository.findById(userInfo.userId);
      if (!existingUser) {
        return reply.status(404).send({
          success: false,
          message: 'Usuário não encontrado.'
        });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;

      const updatedUser = await userRepository.update(userInfo.userId, updateData);

      reply.send({
        success: true,
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          avatar: updatedUser.avatar,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        },
        message: 'Perfil atualizado com sucesso!'
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor. Tente novamente mais tarde.'
      });
    }
  }
}
