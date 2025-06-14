import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadResult, S3ServiceInterface } from '../../services/S3Service';

export class LocalFileService implements S3ServiceInterface {
  private uploadDir: string;
  private baseUrl: string;
  constructor() {
    this.uploadDir = process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
  async uploadFile(file: Buffer, filename: string, mimeType: string, folder: string): Promise<UploadResult> {
    const fileExtension = filename.split('.').pop() || '';
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    const folderPath = path.join(this.uploadDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    const key = `${folder}/${uniqueFilename}`;
    const filePath = path.join(this.uploadDir, folder, uniqueFilename);
      try {
      fs.writeFileSync(filePath, file);
      
      const url = `${this.baseUrl}/api/uploads/files/${key}`;
      
      return {
        key,
        url,
        originalName: filename,
        mimeType,
        size: file.length,
      };
    } catch (error) {
      console.error('Error saving file locally:', error);
      throw new Error('Failed to save file locally');
    }
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting local file:', error);
      throw new Error('Failed to delete local file');
    }
  }
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return `${this.baseUrl}/api/uploads/files/${key}`;
  }
}
