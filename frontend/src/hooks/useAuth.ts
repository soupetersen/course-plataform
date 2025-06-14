import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import type { AuthResponse, LoginInput, RegisterInput, User } from '../types/api';
import { queryKeys } from '../types/api';


export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: async (): Promise<User | null> => {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      try {
        const response = await apiRequest<{ success: boolean; data: User }>({
          method: 'GET',
          url: '/api/auth/me',
        });
        return response.data;
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return null;
      }
    },
    staleTime: 1000 * 60 * 15, 
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginInput): Promise<AuthResponse> => {
      return apiRequest({
        method: 'POST',
        url: '/api/auth/login',
        data: credentials,
      });
    },
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      queryClient.setQueryData(queryKeys.auth, data.data.user);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};


export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: RegisterInput): Promise<AuthResponse> => {
      return apiRequest({
        method: 'POST',
        url: '/api/auth/register',
        data: userData,
      });
    },
    onSuccess: (data) => {
      
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      
      queryClient.setQueryData(queryKeys.auth, data.data.user);
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });
};


export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiRequest({
          method: 'POST',
          url: '/api/auth/logout',
        });
      } catch {
        
      }
    },
    onSettled: () => {
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      queryClient.clear();
    },
  });
};


export const useAuth = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const token = localStorage.getItem('authToken');
  
  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    loginMutation,
    logoutMutation,
  };
};
