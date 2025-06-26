export interface UploadResult {
  key: string;
  url: string;
  filename: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: string;
}

export interface UploadProgressCallback {
  (progress: number): void;
}

export const uploadImage = async (file: File, onProgress?: UploadProgressCallback): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        resolve(result.data);
      } else {
        const errorData = JSON.parse(xhr.responseText);
        reject(new Error(errorData.error || 'Failed to upload image'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during image upload'));
    });

    xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/uploads/image`);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    xhr.send(formData);
  });
};

export const uploadVideo = async (file: File, onProgress?: UploadProgressCallback): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        resolve(result.data);
      } else {
        const errorData = JSON.parse(xhr.responseText);
        reject(new Error(errorData.error || 'Failed to upload video'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during video upload'));
    });

    xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/uploads/video`);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    xhr.send(formData);
  });
};

export const uploadCourseImage = async (file: File, onProgress?: UploadProgressCallback): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        resolve(result.data);
      } else {
        const errorData = JSON.parse(xhr.responseText);
        reject(new Error(errorData.error || 'Failed to upload course image'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during course image upload'));
    });

    xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/uploads/course-image`);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    xhr.send(formData);
  });
};

