import jwt, { Secret, SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtService {
  private readonly secret: Secret;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as SignOptions);
  }

  generateToken(payload: JwtPayload): string {
    return this.sign(payload);
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  extractTokenFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header must start with Bearer');
    }
    return authHeader.substring(7);
  }
}
