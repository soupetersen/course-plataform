import { FastifyRequest, FastifyReply } from 'fastify';

export class SecurityMiddleware {
  static addSecurityHeaders() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      reply.header('X-Content-Type-Options', 'nosniff');
      reply.header('X-Frame-Options', 'DENY');
      reply.header('X-XSS-Protection', '1; mode=block');
      reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      if (process.env.NODE_ENV === 'production') {
        reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
    };
  }

  static rateLimiter(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return async (request: FastifyRequest, reply: FastifyReply) => {
      const clientId = request.ip;
      const now = Date.now();
      
      const clientData = requests.get(clientId);
      
      if (!clientData || now > clientData.resetTime) {
        requests.set(clientId, {
          count: 1,
          resetTime: now + windowMs
        });
        return;
      }
      
      if (clientData.count >= maxRequests) {
        return reply.status(429).send({
          success: false,
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
      }
      
      clientData.count++;
    };
  }

  static logRequest() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const start = Date.now();
      
      reply.raw.on('finish', () => {
        const duration = Date.now() - start;
        request.log.info({
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          duration: `${duration}ms`,
          userAgent: request.headers['user-agent'],
          ip: request.ip
        });
      });
    };
  }
}
