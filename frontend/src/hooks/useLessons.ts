import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Lesson, CreateLessonData, Question, CreateQuestionData, LessonProgress, QuizAttempt } from '@/types/lesson';

// Lesson CRUD hooks
export const useLessons = (courseId: string) => {
  return useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const response = await api.get(`/lessons/course/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });
};

export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await api.get(`/lessons/${lessonId}`);
      return response.data;
    },
    enabled: !!lessonId,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string; data: CreateLessonData }) => {
      const response = await api.post(`/lessons`, { ...data, courseId });
      return response.data;
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
      const response = await api.put(`/lessons/${lessonId}`, data);
      return response.data;
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
      const response = await api.delete(`/lessons/${lessonId}`);
      return response.data;
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
      const response = await api.get(`/questions/lesson/${lessonId}`);
      return response.data;
    },
    enabled: !!lessonId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: string; data: CreateQuestionData }) => {
      const response = await api.post(`/questions`, { ...data, lessonId });
      return response.data;
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
      const response = await api.put(`/questions/${questionId}`, data);
      return response.data;
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
      const response = await api.delete(`/questions/${questionId}`);
      return response.data;
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
      const response = await api.post('/progress/video', {
        userId,
        lessonId,
        courseId,
        watchTime,
      });
      return response.data;
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
      const response = await api.post('/progress/complete', {
        userId,
        lessonId,
        courseId,
      });
      return response.data;
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
      const response = await api.post('/progress/quiz', {
        userId,
        lessonId,
        courseId,
        answers,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });
};

export const useUploadVideo = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
};
