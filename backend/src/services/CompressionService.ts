import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import sharp from 'sharp';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath(ffmpegPath.path);

export interface CompressionOptions {
  maxSizeMB?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export class CompressionService {
  async compressImage(
    buffer: Buffer, 
    options: CompressionOptions = {}
  ): Promise<Buffer> {
    const {
      maxSizeMB = 5,
      quality = 80,
      maxWidth = 1920,
      maxHeight = 1080
    } = options;

    try {
      let result = sharp(buffer)
        .resize(maxWidth, maxHeight, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality });

      let compressed = await result.toBuffer();
      
      let currentQuality = quality;
      while (compressed.length > maxSizeMB * 1024 * 1024 && currentQuality > 20) {
        currentQuality -= 10;
        result = sharp(buffer)
          .resize(maxWidth, maxHeight, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: currentQuality });
        
        compressed = await result.toBuffer();
      }

      return compressed;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Comprime um vídeo usando FFmpeg
   */
  async compressVideo(
    buffer: Buffer, 
    options: CompressionOptions = {}
  ): Promise<Buffer> {
    const {
      maxSizeMB = 50,
      maxWidth = 1920, 
      maxHeight = 1080  
    } = options;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = new Readable();
      inputStream.push(buffer);
      inputStream.push(null);

      const outputStream = ffmpeg(inputStream)
        .inputFormat('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        .videoBitrate('2500k')
        .audioBitrate('128k')  
        .size(`${maxWidth}x${maxHeight}`)
        .fps(30) 
        .outputOptions([
          '-preset medium',
          '-crf 23', 
          '-profile:v high',
          '-level 4.0', 
          '-movflags +faststart',
          '-pix_fmt yuv420p' 
        ])
        .format('mp4')
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error('Failed to compress video: ' + err.message));
        })
        .on('end', () => {
          const result = Buffer.concat(chunks);
          
          console.log(`Video compression completed: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB -> ${(result.length / (1024 * 1024)).toFixed(2)}MB`);
          
          if (result.length > maxSizeMB * 1024 * 1024) {
            console.warn(`Compressed video is still large: ${(result.length / (1024 * 1024)).toFixed(2)}MB`);
          }
          
          resolve(result);
        })
        .pipe();

      outputStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
    });
  }

  /**
   * Verifica se um arquivo precisa ser comprimido
   */
  needsCompression(buffer: Buffer, maxSizeMB: number): boolean {
    return buffer.length > maxSizeMB * 1024 * 1024;
  }

  /**
   * Obtém informações de um vídeo
   */
  async getVideoInfo(buffer: Buffer): Promise<{
    duration: number;
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const tempFile = path.join(os.tmpdir(), `temp_video_${Date.now()}.mp4`);
      
      fs.writeFileSync(tempFile, buffer);

      ffmpeg.ffprobe(tempFile, (err, metadata) => {
        fs.unlinkSync(tempFile);
        
        if (err) {
          reject(new Error('Failed to get video info: ' + err.message));
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        
        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          format: metadata.format.format_name || 'unknown',
          size: buffer.length
        });
      });
    });
  }
}
