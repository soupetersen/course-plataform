export interface UploadResult {
  key: string;
  url: string;
  filename: string;
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/uploads/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload image');
  }

  const result = await response.json();
  return result.data;
};

export const uploadVideo = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/uploads/videos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload video');
  }

  const result = await response.json();
  return result.data;
};
