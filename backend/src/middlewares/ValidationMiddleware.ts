import { FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodSchema } from 'zod';

export class ValidationMiddleware {
  static validateBody(schema: ZodSchema) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        schema.parse(request.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            message: 'Validation error',
            errors: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        
        return reply.status(400).send({
          success: false,
          message: 'Invalid request body'
        });
      }
    };
  }

  static validateParams(schema: ZodSchema) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        schema.parse(request.params);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid parameters',
            errors: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        
        return reply.status(400).send({
          success: false,
          message: 'Invalid request parameters'
        });
      }
    };
  }

  static validateQuery(schema: ZodSchema) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        schema.parse(request.query);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid query parameters',
            errors: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        
        return reply.status(400).send({
          success: false,
          message: 'Invalid query parameters'
        });
      }
    };
  }
}
