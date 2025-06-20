import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { Review, CreateReviewInput, UpdateReviewInput, CourseRatingStats } from '../types/api';
import { queryKeys } from '../types/api';

export const useReviewsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.reviewsByCourse(courseId),
    queryFn: async (): Promise<ApiResponse<Review[]>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/courses/${courseId}/reviews`,
      });
    },
    enabled: !!courseId,
  });
};

export const useCourseRatingStats = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.courseRatingStats(courseId),
    queryFn: async (): Promise<ApiResponse<CourseRatingStats>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/courses/${courseId}/rating-stats`,
      });
    },
    enabled: !!courseId,
  });
};

export const useMyReviews = () => {
  return useQuery({
    queryKey: queryKeys.reviewsByUser('me'),
    queryFn: async (): Promise<ApiResponse<Review[]>> => {
      return apiRequest({
        method: 'GET',
        url: `/api/my-reviews`,
      });
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewInput): Promise<ApiResponse<Review>> => {
      return apiRequest({
        method: 'POST',
        url: `/api/courses/${data.courseId}/reviews`,
        data: {
          rating: data.rating,
          comment: data.comment,
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviewsByCourse(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseRatingStats(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviewsByUser('me'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(variables.courseId),
      });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReviewInput }): Promise<ApiResponse<Review>> => {
      return apiRequest({
        method: 'PUT',
        url: `/api/reviews/${id}`,
        data,
      });
    },
    onSuccess: (response) => {
      const review = response.data;
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviewsByCourse(review.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseRatingStats(review.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviewsByUser('me'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(review.courseId),
      });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      return apiRequest({
        method: 'DELETE',
        url: `/api/reviews/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews,
      });
    },
  });
};
