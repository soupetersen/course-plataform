import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import type { ApiResponse } from '../lib/api';


export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    price: number;
    level: string;
    status: string;
  };
}

export interface EnrollmentStats {
  totalEnrollments: number;
  completedCourses: number;
  averageProgress: number;
  activeCourses: number;
}


export const useMyEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments', 'my-enrollments'],
    queryFn: async (): Promise<ApiResponse<Enrollment[]>> => {
      return apiRequest({
        method: 'GET',
        url: '/api/enrollments/my-enrollments',
      });
    },
    staleTime: 1000 * 60 * 5, 
  });
};


export const useEnrollmentStats = () => {
  const { data: enrollmentsResponse, isLoading } = useMyEnrollments();
  
  const enrollments = enrollmentsResponse?.data || [];
  
  const stats: EnrollmentStats = {
    totalEnrollments: enrollments.length,
    completedCourses: enrollments.filter(e => e.completedAt && e.progress >= 100).length,
    averageProgress: enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
      : 0,
    activeCourses: enrollments.filter(e => e.isActive && !e.completedAt).length,
  };

  return {
    stats,
    isLoading,
    enrollments,
  };
};


export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string): Promise<ApiResponse<Enrollment>> => {
      return apiRequest({
        method: 'POST',
        url: '/api/enrollments',
        data: { courseId },
      });
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};


export const useUpdateEnrollmentProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      progress 
    }: { 
      enrollmentId: string; 
      progress: number; 
    }): Promise<ApiResponse<Enrollment>> => {
      return apiRequest({
        method: 'PATCH',
        url: `/api/enrollments/${enrollmentId}/progress`,
        data: { progress },
      });
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};


export const useUnenrollFromCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string): Promise<ApiResponse<void>> => {
      return apiRequest({
        method: 'DELETE',
        url: `/api/enrollments/${enrollmentId}`,
      });
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
