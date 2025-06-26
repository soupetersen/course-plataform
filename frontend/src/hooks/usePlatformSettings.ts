import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import type { ApiResponse } from '../lib/api';

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  type: "STRING" | "NUMBER" | "BOOLEAN";
  description?: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async (): Promise<ApiResponse<{ settings: PlatformSetting[] }>> => {
      return apiRequest({
        method: 'GET',
        url: '/api/admin/settings',
      });
    },
    staleTime: 1000 * 60 * 5, 
  });
};

export const useUpdatePlatformSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      key, 
      value 
    }: { 
      key: string; 
      value: string; 
    }): Promise<ApiResponse<PlatformSetting>> => {
      return apiRequest({
        method: 'PUT',
        url: `/api/admin/settings/${key}`,
        data: { value },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
    onError: (error) => {
      console.error('Update platform setting error:', error);
    },
  });
};

