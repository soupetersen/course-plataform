import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { 
  Course, 
  CreateCourseInput, 
  UpdateCourseInput, 
  CourseFilters,
} from '../types/api';
import { queryKeys } from '../types/api';


export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async (): Promise<ApiResponse<Course[]>> => {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.level) params.append('level', filters.level);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.instructorId) params.append('instructorId', filters.instructorId);
      
      return apiRequest({
        method: 'GET',
        url: `/api/courses?${params.toString()}`,
      });
    },
    staleTime: 1000 * 60 * 5, 
  });
};


export const useCourse = (id: string) => {
  return useQuery({
    queryKey: queryKeys.course(id),
    queryFn: async (): Promise<ApiResponse<Course>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/courses/${id}`,
      });
    },
    enabled: !!id,
  });
};


export const useCoursesByInstructor = (instructorId: string) => {
  return useQuery({
    queryKey: queryKeys.coursesByInstructor(instructorId),
    queryFn: async (): Promise<ApiResponse<Course[]>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/courses/instructor/${instructorId}`,
      });
    },
    enabled: !!instructorId,
  });
};


export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseData: CreateCourseInput): Promise<ApiResponse<Course>> => {
      return apiRequest({
        method: 'POST',
        url: '/api/courses',
        data: courseData,
      });
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
    onError: (error) => {
      console.error('Create course error:', error);
    },
  });
};


export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateCourseInput 
    }): Promise<ApiResponse<Course>> => {
      return apiRequest({
        method: 'PUT',
        url: `/api/courses/${id}`,
        data,
      });
    },
    onSuccess: (data, variables) => {
      
      queryClient.setQueryData(
        queryKeys.course(variables.id), 
        data
      );
      
      
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
    onError: (error) => {
      console.error('Update course error:', error);
    },
  });
};


export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      return apiRequest({
        method: 'DELETE',
        url: `/api/courses/${id}`,
      });
    },
    onSuccess: (_, id) => {
      
      queryClient.removeQueries({ queryKey: queryKeys.course(id) });
      
      
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
    onError: (error) => {
      console.error('Delete course error:', error);
    },
  });
};


export const usePublishCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<ApiResponse<Course>> => {
      return apiRequest({
        method: 'PATCH',
        url: `/api/courses/${id}/publish`,
      });
    },
    onSuccess: (data, id) => {
      
      queryClient.setQueryData(queryKeys.course(id), data);
      
      
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
    onError: (error) => {
      console.error('Publish course error:', error);
    },
  });
};

export const useUnpublishCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<ApiResponse<Course>> => {
      return apiRequest({
        method: 'PATCH',
        url: `/api/courses/${id}/unpublish`,
      });
    },
    onSuccess: (data, id) => {
      
      queryClient.setQueryData(queryKeys.course(id), data);
      
      
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
    onError: (error) => {
      console.error('Unpublish course error:', error);
    },
  });
};
