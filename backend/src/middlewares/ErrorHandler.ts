import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export class ErrorHandler {
  static handle(error: FastifyError | ApiError, request: FastifyRequest, reply: FastifyReply) {
    request.log.error(error);

    
    if ('validation' in error && error.validation) {
      return reply.status(400).send({
        success: false,
        message: 'Validation error',
        errors: error.validation,
        code: 'VALIDATION_ERROR'
      });
    }

    
    if (error.message?.includes('jwt') || error.message?.includes('token')) {
      return reply.status(401).send({
        success: false,
        message: 'Authentication failed',
        code: 'AUTH_ERROR'
      });
    }

    
    if (error.message?.includes('Unique constraint')) {
      return reply.status(409).send({
        success: false,
        message: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE'
      });
    }

    if (error.message?.includes('Record to update not found')) {
      return reply.status(404).send({
        success: false,
        message: 'Resource not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    if (error.message?.includes('Foreign key constraint')) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid reference to related resource',
        code: 'INVALID_REFERENCE'
      });
    }

    
    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    
    if ('statusCode' in error && error.statusCode) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
        code: error.code || 'API_ERROR'
      });
    }

    
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : error.message;

    return reply.status(statusCode).send({
      success: false,
      message,
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}


export class NotFoundError extends Error implements ApiError {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error implements ApiError {
  statusCode = 401;
  code = 'UNAUTHORIZED';

  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error implements ApiError {
  statusCode = 403;
  code = 'FORBIDDEN';

  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class BadRequestError extends Error implements ApiError {
  statusCode = 400;
  code = 'BAD_REQUEST';

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends Error implements ApiError {
  statusCode = 409;
  code = 'CONFLICT';

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
