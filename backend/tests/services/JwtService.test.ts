import { JwtService, JwtPayload } from '../../src/services/JwtService';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('JwtService', () => {
  let jwtService: JwtService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    jwtService = new JwtService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should use environment variables for secret and expiration', () => {
      expect(jwtService['secret']).toBe('test-secret');
      expect(jwtService['expiresIn']).toBe('1h');
    });

    it('should use default values when environment variables are not set', () => {
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRES_IN;
      
      const defaultJwtService = new JwtService();
      
      expect(defaultJwtService['secret']).toBe('default-secret-key');
      expect(defaultJwtService['expiresIn']).toBe('24h');
    });
  });

  describe('sign', () => {
    it('should sign payload successfully', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT'
      };
      const expectedToken = 'signed-jwt-token';

      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = jwtService.sign(payload);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        payload,
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe('generateToken', () => {
    it('should call sign method', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT'
      };
      const expectedToken = 'signed-jwt-token';

      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = jwtService.generateToken(payload);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        payload,
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', () => {
      const token = 'valid-jwt-token';
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT'
      };

      mockedJwt.verify.mockReturnValue(payload as any);

      const result = jwtService.verifyToken(token);

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toEqual(payload);
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-jwt-token';
      
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('JsonWebTokenError');
      });

      expect(() => jwtService.verifyToken(token)).toThrow('Invalid or expired token');
      expect(mockedJwt.verify).toHaveBeenCalledWith(token, 'test-secret');
    });

    it('should throw error for expired token', () => {
      const token = 'expired-jwt-token';
      
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('TokenExpiredError');
      });

      expect(() => jwtService.verifyToken(token)).toThrow('Invalid or expired token');
      expect(mockedJwt.verify).toHaveBeenCalledWith(token, 'test-secret');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const authHeader = 'Bearer valid-jwt-token';
      const expectedToken = 'valid-jwt-token';

      const result = jwtService.extractTokenFromHeader(authHeader);

      expect(result).toBe(expectedToken);
    });

    it('should throw error for missing authorization header', () => {
      expect(() => jwtService.extractTokenFromHeader('')).toThrow(
        'Authorization header must start with Bearer'
      );
    });

    it('should throw error for invalid authorization header format', () => {
      const invalidHeaders = [
        'Basic token',
        'Bearer',
        'token',
        'bearer valid-jwt-token'
      ];

      invalidHeaders.forEach(header => {
        expect(() => jwtService.extractTokenFromHeader(header)).toThrow(
          'Authorization header must start with Bearer'
        );
      });
    });

    it('should handle null or undefined header', () => {
      expect(() => jwtService.extractTokenFromHeader(null as any)).toThrow(
        'Authorization header must start with Bearer'
      );
      expect(() => jwtService.extractTokenFromHeader(undefined as any)).toThrow(
        'Authorization header must start with Bearer'
      );
    });
  });
});
