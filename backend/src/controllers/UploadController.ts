import { FastifyRequest, FastifyReply } from 'fastify';
import { S3Service } from '@/services/S3Service';

export class UploadController {
  private s3Service: S3Service;

  constructor(s3Service: S3Service) {
    this.s3Service = s3Service;
  }

  public uploadImage = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({ error: 'No file provided' });
        return;
      }

      const buffer = await data.toBuffer();
      const { filename, mimetype } = data;
      
      if (!mimetype.startsWith('image/')) {
        reply.status(400).send({ error: 'File must be an image' });
        return;
      }

      const result = await this.s3Service.uploadFile(
        buffer,
        filename,
        mimetype,
        process.env.AWS_S3_IMAGES_FOLDER || 'images'
      );

      reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      reply.status(500).send({ 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public uploadCourseImage = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({ 
          success: false,
          error: 'No image file provided' 
        });
        return;
      }

      const buffer = await data.toBuffer();
      const { filename, mimetype } = data;
      
      if (!mimetype.startsWith('image/')) {
        reply.status(400).send({ 
          success: false,
          error: 'File must be an image (jpeg, png, webp, etc.)' 
        });
        return;
      }

      
      const result = await this.s3Service.uploadFile(
        buffer,
        filename,
        mimetype,
        'courses/images'
      );

      reply.status(200).send({
        success: true,
        message: 'Course image uploaded successfully',
        data: {
          imageUrl: result.url,
          key: result.key,
          size: result.size
        }
      });
    } catch (error) {
      console.error('Error uploading course image:', error);
      reply.status(500).send({ 
        success: false,
        error: 'Failed to upload course image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public uploadVideo = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({ error: 'No file provided' });
        return;
      }

      const buffer = await data.toBuffer();
      const { filename, mimetype } = data;
      
      if (!mimetype.startsWith('video/')) {
        reply.status(400).send({ error: 'File must be a video' });
        return;
      }

      const result = await this.s3Service.uploadFile(
        buffer,
        filename,
        mimetype,
        process.env.AWS_S3_VIDEOS_FOLDER || 'videos'
      );

      reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      reply.status(500).send({ 
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public uploadFile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({ error: 'No file provided' });
        return;
      }

      const buffer = await data.toBuffer();
      const { filename, mimetype } = data;
      const body = request.body as any;
      const { folder } = body;

      if (!folder) {
        reply.status(400).send({ error: 'Folder parameter is required' });
        return;
      }

      const result = await this.s3Service.uploadFile(
        buffer,
        filename,
        mimetype,
        folder
      );

      reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      reply.status(500).send({ 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public deleteFile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const params = request.params as { key: string };
      const { key } = params;

      if (!key) {
        reply.status(400).send({ error: 'File key is required' });
        return;
      }

      await this.s3Service.deleteFile(key);

      reply.status(200).send({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      reply.status(500).send({ 
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getSignedUrl = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const params = request.params as { key: string };
      const query = request.query as { expiresIn?: string };
      const { key } = params;
      const { expiresIn } = query;

      if (!key) {
        reply.status(400).send({ error: 'File key is required' });
        return;
      }

      const expiration = expiresIn ? parseInt(expiresIn) : 3600;
      const signedUrl = await this.s3Service.getSignedUrl(key, expiration);

      reply.status(200).send({
        success: true,
        data: {
          signedUrl,
          expiresIn: expiration,
        },
      });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      reply.status(500).send({ 
        error: 'Failed to generate signed URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public serveFile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const params = request.params as { filename: string };
      const { filename } = params;

      if (!filename) {
        reply.status(400).send({ error: 'Filename is required' });
        return;
      }

      
      const signedUrl = await this.s3Service.getSignedUrl(filename);
      
      reply.redirect(302, signedUrl);
    } catch (error) {
      console.error('Error serving file:', error);
      reply.status(404).send({ 
        error: 'File not found',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
