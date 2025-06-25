import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLessonWebSocket } from './useLessonWebSocket';
import { useLessonComments } from './useLessonComments';
import { LessonComment } from '@/types/api';

interface UseLessonCommentsRealtimeProps {
  lessonId: string;
  token: string;
}

export const useLessonCommentsRealtime = ({ lessonId, token }: UseLessonCommentsRealtimeProps) => {
  const queryClient = useQueryClient();
  const { data: comments = [], isLoading, error } = useLessonComments(lessonId);
  const { isConnected, sendComment, newComment, error: wsError } = useLessonWebSocket(token);
  
  const [localComments, setLocalComments] = useState<LessonComment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar comentários iniciais
  useEffect(() => {
    if (comments.length > 0) {
      setLocalComments(comments);
    }
  }, [comments]);

  // Escutar novos comentários via WebSocket
  useEffect(() => {
    if (newComment && newComment.lessonId === lessonId) {
      setLocalComments(prev => {
        // Verificar se o comentário já existe para evitar duplicatas
        const exists = prev.some(comment => comment.id === newComment.id);
        if (exists) return prev;
        
        // Adicionar novo comentário no final da lista
        return [...prev, newComment];
      });
      
      // Invalidar a query para manter sincronização
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
    }
  }, [newComment, lessonId, queryClient]);

  // Função para enviar comentário via WebSocket
  const addCommentRealtime = useCallback(async (content: string) => {
    if (!isConnected || !content.trim()) {
      throw new Error('Não conectado ou conteúdo vazio');
    }

    setIsSubmitting(true);
    
    try {
      // Enviar via WebSocket para tempo real
      sendComment(content.trim());
      
      // Aguardar um pouco para dar tempo do WebSocket processar
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, sendComment]);

  return {
    comments: localComments,
    isLoading,
    isSubmitting,
    addComment: addCommentRealtime,
    isConnected,
    error: error || wsError,
  };
};
