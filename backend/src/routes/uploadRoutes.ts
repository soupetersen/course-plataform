import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { UploadController } from '@/controllers/UploadController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';

export const createUploadRoutes = (uploadController: UploadController): FastifyPluginCallback => {
  return async function uploadRoutes(fastify: FastifyInstance) {
    const authMiddleware = new AuthMiddleware();

    
    fastify.post('/image', {
      preHandler: [
        authMiddleware.authenticate.bind(authMiddleware),
        authMiddleware.requireRole(['INSTRUCTOR', 'ADMIN'])
      ],
      handler: uploadController.uploadImage,
    });

    
    fastify.post('/course-image', {
      preHandler: [
        authMiddleware.authenticate.bind(authMiddleware),
        authMiddleware.requireRole(['INSTRUCTOR', 'ADMIN'])
      ],
      handler: uploadController.uploadCourseImage,
    });

    
    fastify.post('/video', {
      preHandler: [
        authMiddleware.authenticate.bind(authMiddleware),
        authMiddleware.requireRole(['INSTRUCTOR', 'ADMIN'])
      ],
      handler: uploadController.uploadVideo,
    });

    
    fastify.post('/video/metadata', {
      preHandler: [
        authMiddleware.authenticate.bind(authMiddleware),
        authMiddleware.requireRole(['INSTRUCTOR', 'ADMIN'])
      ],
      handler: uploadController.getVideoMetadata,
    });

    
    fastify.get('/files/:filename', {
      handler: uploadController.serveFile,
    });

    
    fastify.delete('/files/:filename', {
      preHandler: [
        authMiddleware.authenticate.bind(authMiddleware),
        authMiddleware.requireRole(['INSTRUCTOR', 'ADMIN'])
      ],
      handler: uploadController.deleteFile,
    });
  };
};
