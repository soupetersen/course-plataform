import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { 
  Module, 
  CreateModuleInput,
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
} from '../types/api';
import { queryKeys } from '../types/api';




export const useModulesByCourse = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.modulesByCourse(courseId),
    queryFn: async (): Promise<ApiResponse<Module[]>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/modules/course/${courseId}`,
      });
    },
    enabled: !!courseId,
  });
};


export const useModule = (id: string) => {
  return useQuery({
    queryKey: queryKeys.module(id),
    queryFn: async (): Promise<ApiResponse<Module>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/modules/${id}`,
      });
    },
    enabled: !!id,
  });
};


export const useCreateModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (moduleData: CreateModuleInput): Promise<ApiResponse<Module>> => {
      return apiRequest({
        method: 'POST',
        url: '/api/modules',
        data: moduleData,
      });
    },
    onSuccess: (data) => {
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.modulesByCourse(data.data.courseId) 
      });
      
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.course(data.data.courseId) 
      });
    },
    onError: (error) => {
      console.error('Create module error:', error);
    },
  });
};


export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<CreateModuleInput> 
    }): Promise<ApiResponse<Module>> => {
      return apiRequest({
        method: 'PUT',
        url: `/api/modules/${id}`,
        data,
      });
    },
    onSuccess: (data, variables) => {
      
      queryClient.setQueryData(queryKeys.module(variables.id), data);
      
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.modulesByCourse(data.data.courseId) 
      });
    },
    onError: (error) => {
      console.error('Update module error:', error);
    },
  });
};


export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      return apiRequest({
        method: 'DELETE',
        url: `/api/modules/${id}`,
      });
    },
    onSuccess: (_, id) => {
      
      queryClient.removeQueries({ queryKey: queryKeys.module(id) });
      
      
      queryClient.invalidateQueries({ queryKey: queryKeys.modules });
    },
    onError: (error) => {
      console.error('Delete module error:', error);
    },
  });
};




export const useLessonsByModule = (moduleId: string) => {
  return useQuery({
    queryKey: queryKeys.lessonsByModule(moduleId),
    queryFn: async (): Promise<ApiResponse<Lesson[]>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/lessons/module/${moduleId}`,
      });
    },
    enabled: !!moduleId,
  });
};


export const useLesson = (id: string) => {
  return useQuery({
    queryKey: queryKeys.lesson(id),
    queryFn: async (): Promise<ApiResponse<Lesson>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/lessons/${id}`,
      });
    },
    enabled: !!id,
  });
};


export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lessonData: CreateLessonInput): Promise<ApiResponse<Lesson>> => {
      return apiRequest({
        method: 'POST',
        url: `/api/courses/${lessonData.courseId}/lessons`,
        data: lessonData,
      });
    },
    onSuccess: (data) => {
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.lessonsByModule(data.data.moduleId) 
      });
      
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.module(data.data.moduleId) 
      });
    },
    onError: (error) => {
      console.error('Create lesson error:', error);
    },
  });
};


export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateLessonInput 
    }): Promise<ApiResponse<Lesson>> => {
      return apiRequest({
        method: 'PUT',
        url: `/api/lessons/${id}`,
        data,
      });
    },
    onSuccess: (data, variables) => {
      
      queryClient.setQueryData(queryKeys.lesson(variables.id), data);
      
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.lessonsByModule(data.data.moduleId) 
      });
    },
    onError: (error) => {
      console.error('Update lesson error:', error);
    },
  });
};


export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      return apiRequest({
        method: 'DELETE',
        url: `/api/lessons/${id}`,
      });
    },
    onSuccess: (_, id) => {
      
      queryClient.removeQueries({ queryKey: queryKeys.lesson(id) });
      
      
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
    },
    onError: (error) => {
      console.error('Delete lesson error:', error);
    },
  });
};


export const useCompleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lessonId: string): Promise<ApiResponse<void>> => {
      return apiRequest({
        method: 'POST',
        url: `/api/lessons/${lessonId}/complete`,
      });
    },
    onSuccess: (_, lessonId) => {
      
      queryClient.invalidateQueries({ queryKey: queryKeys.lesson(lessonId) });
      
      
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
    },
    onError: (error) => {
      console.error('Complete lesson error:', error);
    },
  });
};

