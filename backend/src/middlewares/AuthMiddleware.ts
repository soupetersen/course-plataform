import { JwtService } from '@/services/JwtService';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

export class AuthMiddleware {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        return reply.status(401).send({
          success: false,
          message: 'Authorization header is required'
        });
      }

      const token = this.jwtService.extractTokenFromHeader(authHeader);
      const payload = this.jwtService.verifyToken(token);

      (request as any).userInfo = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };

    } catch (error) {
      return reply.status(401).send({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid token'
      });
    }
  }

  requireRole(roles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const userInfo = (request as any).userInfo as UserInfo;
      
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!roles.includes(userInfo.role)) {
        return reply.status(403).send({
          success: false,
          message: 'Insufficient permissions'
        });
      }
    };
  }

  requireInstructor() {
    return this.requireRole(['INSTRUCTOR', 'ADMIN']);
  }

  requireAdmin() {
    return this.requireRole(['ADMIN']);
  }
}
