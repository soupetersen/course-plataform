import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LessonComment } from '@/types/api';

export interface CreateCommentData {
  content: string;
}

// Hook para buscar comentários de uma lição
export const useLessonComments = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson-comments', lessonId],
    queryFn: async (): Promise<LessonComment[]> => {
      const response = await api.get(`/api/lessons/${lessonId}/comments`);
      return response.data.data;
    },
    enabled: !!lessonId,
  });
};

// Hook para adicionar um comentário a uma lição
export const useAddLessonComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: string; data: CreateCommentData }): Promise<LessonComment> => {
      const response = await api.post(`/api/lessons/${lessonId}/comments`, data);
      return response.data.data;
    },
    onSuccess: (_data: LessonComment, variables: { lessonId: string; data: CreateCommentData }) => {
      // Invalida a query de comentários para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', variables.lessonId] });
    },
  });
};
