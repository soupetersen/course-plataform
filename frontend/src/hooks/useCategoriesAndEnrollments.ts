import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { 
  Category, 
  Enrollment,
} from '../types/api';
import { queryKeys } from '../types/api';




export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async (): Promise<ApiResponse<Category[]>> => {
      return apiRequest({
        method: 'GET',
        url: '/api/categories',
      });
    },
    staleTime: 1000 * 60 * 30, 
  });
};


export const useCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: async (): Promise<ApiResponse<Category>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/categories/${id}`,
      });
    },
    enabled: !!id,
  });
};




export const useEnrollmentsByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.enrollmentsByUser(userId),
    queryFn: async (): Promise<ApiResponse<Enrollment[]>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/enrollments/user/${userId}`,
      });
    },
    enabled: !!userId,
  });
};


export const useEnrollmentsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.enrollmentsByCourse(courseId),
    queryFn: async (): Promise<ApiResponse<Enrollment[]>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/enrollments/course/${courseId}`,
      });
    },
    enabled: !!courseId,
  });
};


export const useEnrollment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.enrollment(id),
    queryFn: async (): Promise<ApiResponse<Enrollment>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/enrollments/${id}`,
      });
    },
    enabled: !!id,
  });
};


export const useIsEnrolled = (courseId: string, userId: string) => {
  return useQuery({
    queryKey: ['enrollment-check', courseId, userId],
    queryFn: async (): Promise<ApiResponse<{ isEnrolled: boolean; enrollment?: Enrollment }>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/enrollments/check/${courseId}/${userId}`,
      });
    },
    enabled: !!(courseId && userId),
  });
};


export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseId: string): Promise<ApiResponse<Enrollment>> => {
      return apiRequest({
        method: 'POST',
        url: '/api/enrollments',
        data: { courseId },
      });
    },
    onSuccess: (data) => {
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.enrollmentsByUser(data.data.userId) 
      });
      
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.enrollmentsByCourse(data.data.courseId) 
      });
      
      
      queryClient.invalidateQueries({ 
        queryKey: ['enrollment-check', data.data.courseId, data.data.userId] 
      });
    },
    onError: (error) => {
      console.error('Create enrollment error:', error);
    },
  });
};


export const useCancelEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (enrollmentId: string): Promise<ApiResponse<void>> => {
      return apiRequest({
        method: 'DELETE',
        url: `/api/enrollments/${enrollmentId}`,
      });
    },
    onSuccess: (_, enrollmentId) => {
      
      queryClient.removeQueries({ queryKey: queryKeys.enrollment(enrollmentId) });
      
      
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
    },
    onError: (error) => {
      console.error('Cancel enrollment error:', error);
    },
  });
};


export const useMyEnrollments = () => {
  const storedUser = localStorage.getItem('user');
  const userId = storedUser ? JSON.parse(storedUser).id : null;
  
  return useQuery({
    queryKey: ['my-enrollments', userId],
    queryFn: async (): Promise<ApiResponse<Enrollment[]>> => {
      return apiRequest({
        method: 'GET',
        url: '/api/enrollments/my',
      });
    },
    enabled: !!userId,
  });
};
