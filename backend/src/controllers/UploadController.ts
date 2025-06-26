import { FastifyRequest, FastifyReply } from 'fastify';
import { S3Service } from '@/services/S3Service';
import { CompressionService } from '@/services/CompressionService';

export class UploadController {
  private s3Service: S3Service;
  private compressionService: CompressionService;

  constructor(s3Service: S3Service) {
    this.s3Service = s3Service;
    this.compressionService = new CompressionService();
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

      // Validar tamanho (max 5MB)
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxImageSize) {
        reply.status(400).send({ 
          error: 'Image file too large. Maximum size allowed: 5MB' 
        });
        return;
      }

      let finalBuffer = buffer;
      if (this.compressionService.needsCompression(buffer, 2)) { // Comprimir se > 2MB
        finalBuffer = await this.compressionService.compressImage(buffer, {
          maxSizeMB: 2,
          quality: 85,
          maxWidth: 1920,
          maxHeight: 1080
        });
      }

      const result = await this.s3Service.uploadFile(
        finalBuffer,
        filename,
        mimetype,
        process.env.AWS_S3_IMAGES_FOLDER || 'images'
      );

      reply.status(200).send({
        success: true,
        data: {
          ...result,
          originalSize: buffer.length,
          compressedSize: finalBuffer.length,
          compressionRatio: ((buffer.length - finalBuffer.length) / buffer.length * 100).toFixed(2) + '%'
        },
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

      // Validar tamanho (max 5MB)
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxImageSize) {
        reply.status(400).send({ 
          success: false,
          error: 'Image file too large. Maximum size allowed: 5MB' 
        });
        return;
      }

      // Comprimir imagem se necessário
      let finalBuffer = buffer;
      if (this.compressionService.needsCompression(buffer, 2)) { // Comprimir se > 2MB
        finalBuffer = await this.compressionService.compressImage(buffer, {
          maxSizeMB: 2,
          quality: 85,
          maxWidth: 1920,
          maxHeight: 1080
        });
      }

      
      const result = await this.s3Service.uploadFile(
        finalBuffer,
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
          size: result.size,
          originalSize: buffer.length,
          compressedSize: finalBuffer.length,
          compressionRatio: ((buffer.length - finalBuffer.length) / buffer.length * 100).toFixed(2) + '%'
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

  public uploadAvatar = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({ 
          success: false,
          error: 'No avatar image provided' 
        });
        return;
      }

      const buffer = await data.toBuffer();
      const { filename, mimetype } = data;
      
      if (!mimetype.startsWith('image/')) {
        reply.status(400).send({ 
          success: false,
          error: 'Avatar must be an image (jpeg, png, webp, etc.)' 
        });
        return;
      }

      // Validar tamanho (max 2MB para avatar)
      const maxAvatarSize = 2 * 1024 * 1024; // 2MB
      if (buffer.length > maxAvatarSize) {
        reply.status(400).send({ 
          success: false,
          error: 'Avatar image too large. Maximum size allowed: 2MB' 
        });
        return;
      }

      // Comprimir e redimensionar avatar para 300x300
      let finalBuffer = buffer;
      finalBuffer = await this.compressionService.compressImage(buffer, {
        maxSizeMB: 0.5, // Máximo 500KB para avatar
        quality: 90,
        maxWidth: 300,
        maxHeight: 300
      });

      const result = await this.s3Service.uploadFile(
        finalBuffer,
        `avatar-${Date.now()}-${filename}`,
        mimetype,
        'avatars'
      );

      reply.status(200).send({
        success: true,
        data: {
          ...result,
          originalSize: buffer.length,
          compressedSize: finalBuffer.length,
          compressionRatio: ((buffer.length - finalBuffer.length) / buffer.length * 100).toFixed(2) + '%'
        },
        message: 'Avatar uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      reply.status(500).send({ 
        success: false,
        error: 'Failed to upload avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public uploadVideo = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({ 
          success: false,
          error: 'No video file provided' 
        });
        return;
      }

      const allowedMimeTypes = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
      ];

      if (!allowedMimeTypes.includes(data.mimetype)) {
        reply.status(400).send({
          success: false,
          error: 'Invalid file type. Only videos are allowed.'
        });
        return;
      }

      // Validar tamanho (max 50MB) - processamento por chunks
      const maxSize = 50 * 1024 * 1024; // 50MB
      const chunks = [];
      let totalSize = 0;

      for await (const chunk of data.file) {
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          reply.status(400).send({
            success: false,
            error: 'Video file too large. Maximum size allowed: 50MB'
          });
          return;
        }
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const { filename } = data;

      let finalBuffer = buffer;
      if (this.compressionService.needsCompression(buffer, 30)) { // Comprimir se > 30MB
        try {
          finalBuffer = await this.compressionService.compressVideo(buffer, {
            maxSizeMB: 50,
            maxWidth: 1920,  // 1080p
            maxHeight: 1080  // 1080p
          });
        } catch (compressionError) {
          console.warn('Video compression failed, uploading original:', compressionError);
          // Se a compressão falhar, usar o arquivo original se estiver dentro do limite
          if (buffer.length > 50 * 1024 * 1024) {
            reply.status(400).send({
              success: false,
              error: 'Video file too large and compression failed. Maximum size allowed: 50MB'
            });
            return;
          }
        }
      }

      const result = await this.s3Service.uploadFile(
        finalBuffer,
        filename,
        data.mimetype,
        process.env.AWS_S3_VIDEOS_FOLDER || 'videos'
      );

      // Extrair metadados do vídeo
      let videoMetadata;
      try {
        videoMetadata = await this.compressionService.getVideoInfo(buffer);
      } catch (metadataError) {
        console.warn('Failed to extract video metadata:', metadataError);
        videoMetadata = {
          duration: 0,
          width: 0,
          height: 0,
          format: 'unknown',
          size: buffer.length
        };
      }

      reply.status(200).send({
        success: true,
        data: {
          url: result.url,
          key: result.key,
          originalName: result.originalName,
          size: result.size,
          mimeType: result.mimeType,
          originalSize: buffer.length,
          compressedSize: finalBuffer.length,
          compressionRatio: ((buffer.length - finalBuffer.length) / buffer.length * 100).toFixed(2) + '%',
          // Metadados do vídeo
          duration: Math.round(videoMetadata.duration),
          width: videoMetadata.width,
          height: videoMetadata.height,
          format: videoMetadata.format,
          formattedDuration: this.formatDuration(videoMetadata.duration)
        },
        message: 'Video uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      reply.status(500).send({ 
        success: false,
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

  public getVideoMetadata = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const { videoUrl, buffer } = request.body as { videoUrl?: string; buffer?: Buffer };

      if (!videoUrl && !buffer) {
        reply.status(400).send({
          success: false,
          error: 'Video URL or buffer is required'
        });
        return;
      }

      let metadata;
      
      if (buffer) {
        // Se temos o buffer do vídeo, usar diretamente
        metadata = await this.compressionService.getVideoInfo(buffer);
      } else {
        // Se apenas temos a URL, tentar baixar e analisar (para casos futuros)
        reply.status(400).send({
          success: false,
          error: 'Video buffer analysis not implemented for URLs yet'
        });
        return;
      }

      reply.status(200).send({
        success: true,
        data: {
          duration: Math.round(metadata.duration),
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size,
          formattedDuration: this.formatDuration(metadata.duration)
        }
      });

    } catch (error) {
      console.error('Error getting video metadata:', error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
}
