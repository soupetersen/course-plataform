import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CreateLessonData, CreateQuestionData } from '@/types/lesson';

// Lesson CRUD hooks
export const useLessons = (courseId: string) => {
  return useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const response = await api.get(`/api/courses/${courseId}/lessons`);
      return response.data.data;
    },
    enabled: !!courseId,
  });
};

export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await api.get(`/api/lessons/${lessonId}`);
      return response.data.data;
    },
    enabled: !!lessonId,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string; data: CreateLessonData }) => {
      const response = await api.post(`/api/courses/${courseId}/lessons`, { ...data, courseId });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId] });
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: string; data: Partial<CreateLessonData> }) => {
      const response = await api.put(`/api/lessons/${lessonId}`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await api.delete(`/api/lessons/${lessonId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
};

// Question management hooks
export const useQuestions = (lessonId: string) => {
  return useQuery({
    queryKey: ['questions', lessonId],
    queryFn: async () => {
      const response = await api.get(`/api/questions/lesson/${lessonId}`);
      return response.data.data;
    },
    enabled: !!lessonId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: string; data: CreateQuestionData }) => {
      const response = await api.post(`/api/questions`, { ...data, lessonId });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions', variables.lessonId] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: Partial<CreateQuestionData> }) => {
      const response = await api.put(`/api/questions/${questionId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await api.delete(`/api/questions/${questionId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};

// Progress and Quiz hooks
export const useUpdateVideoProgress = () => {
  return useMutation({
    mutationFn: async ({ userId, lessonId, courseId, watchTime }: {
      userId: string;
      lessonId: string;
      courseId: string;
      watchTime: number;
    }) => {
      const response = await api.post('/api/progress/video', {
        userId,
        lessonId,
        courseId,
        watchTime,
      });
      return response.data.data;
    },
  });
};

export const useCompleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, lessonId, courseId }: {
      userId: string;
      lessonId: string;
      courseId: string;
    }) => {
      const response = await api.post('/api/progress/complete', {
        userId,
        lessonId,
        courseId,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, lessonId, courseId, answers }: {
      userId: string;
      lessonId: string;
      courseId: string;
      answers: Array<{
        questionId: string;
        selectedOptionId?: string;
        timeSpent: number;
      }>;
    }) => {
      const response = await api.post('/api/progress/quiz', {
        userId,
        lessonId,
        courseId,
        answers,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });
};

export const useUploadVideo = () => {
  return useMutation({
    mutationFn: async ({file, onProgress}: {file: File, onProgress?: (progress: number) => void}) => {
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

        xhr.open('POST', '/api/uploads/video');
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
        xhr.send(formData);
      });
    },
  });
};
