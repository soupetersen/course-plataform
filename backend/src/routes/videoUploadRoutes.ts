import { FastifyInstance } from 'fastify';
import { VideoUploadController } from '@/controllers/VideoUploadController';
import { S3Service } from '@/services/S3Service';

export const createVideoUploadRoutes = (fastify: FastifyInstance) => {
  const s3Service = new S3Service();
  const videoUploadController = new VideoUploadController(s3Service);

  fastify.post('/video', {
    handler: videoUploadController.uploadVideo.bind(videoUploadController),
  });

  fastify.post('/video/metadata', {
    handler: videoUploadController.getVideoMetadata.bind(videoUploadController),
  });
};
