import { FastifyRequest, FastifyReply } from 'fastify';
import { S3Service } from '@/services/S3Service';
import { randomUUID } from 'crypto';

export class VideoUploadController {
  constructor(private s3Service: S3Service) {}

  async uploadVideo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      // Validar tipo de arquivo
      const allowedMimeTypes = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
      ];

      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          message: 'Tipo de arquivo não permitido. Apenas vídeos são aceitos.'
        });
      }

      // Validar tamanho (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB
      const chunks = [];
      let totalSize = 0;

      for await (const chunk of data.file) {
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          return reply.status(400).send({
            success: false,
            message: 'Arquivo muito grande. Tamanho máximo permitido: 500MB'
          });
        }
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const fileName = `${randomUUID()}-${data.filename}`;

      const uploadResult = await this.s3Service.uploadFile(buffer, fileName, data.mimetype, 'videos');

      return reply.status(200).send({
        success: true,
        data: {
          url: uploadResult.url,
          key: uploadResult.key,
          originalName: uploadResult.originalName,
          size: uploadResult.size,
          mimeType: uploadResult.mimeType
        },
        message: 'Vídeo enviado com sucesso'
      });

    } catch (error) {
      console.error('Error uploading video:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getVideoMetadata(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { videoUrl } = request.body as { videoUrl: string };

      if (!videoUrl) {
        return reply.status(400).send({
          success: false,
          message: 'URL do vídeo é obrigatória'
        });
      }

      // Aqui você pode usar uma biblioteca como ffprobe para extrair metadados
      // Por enquanto, vou retornar dados mock
      const metadata = {
        duration: 0, // em segundos
        width: 1920,
        height: 1080,
        fileSize: 0,
        format: 'mp4'
      };

      return reply.status(200).send({
        success: true,
        data: metadata
      });

    } catch (error) {
      console.error('Error getting video metadata:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
