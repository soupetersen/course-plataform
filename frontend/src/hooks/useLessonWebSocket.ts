import { useEffect, useRef, useState, useCallback } from 'react';
import { LessonComment } from '@/types/api';

interface WebSocketMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp?: number;
}

interface LessonProgress {
  watchTime: number;
  isCompleted: boolean;
  completedAt?: string | Date;
}

interface QuizResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  isPassing: boolean;
  message: string;
}

interface UseLessonWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  joinLesson: (lessonId: string, courseId: string) => void;
  updateVideoProgress: (watchTime: number) => void;
  completeLesson: () => void;
  submitQuiz: (answers: Array<{ questionId: string; selectedOptionId?: string; timeSpent: number }>) => void;
  sendComment: (content: string) => void;
  lastMessage: WebSocketMessage | null;
  lessonProgress: LessonProgress | null;
  quizResult: QuizResult | null;
  newComment: LessonComment | null;
  error: string | null;
}

export const useLessonWebSocket = (token?: string): UseLessonWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [newComment, setNewComment] = useState<LessonComment | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');
      setError(null);
      
      const wsUrl = `${process.env.NODE_ENV === 'production' ? 'wss:' : 'ws:'}//localhost:3000/ws/lessons?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔌 WebSocket conectado');
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          switch (message.type) {
            case 'connected':
              console.log('✅ Conectado como:', message.data);
              break;
              
            case 'lesson_joined':
              console.log('🎓 Entrou na lição:', message.data);
              if (message.data.progress) {
                const progress = message.data.progress as Record<string, unknown>;
                setLessonProgress({
                  watchTime: (progress.watchTime as number) || 0,
                  isCompleted: (progress.isCompleted as boolean) || false,
                  completedAt: progress.completedAt ? 
                    (typeof progress.completedAt === 'string' ? progress.completedAt : String(progress.completedAt)) 
                    : undefined
                });
              }
              break;
              
            case 'progress_updated':
              console.log('📊 Progresso atualizado:', message.data);
              setLessonProgress(prev => prev ? { ...prev, watchTime: message.data.watchTime as number } : null);
              break;
              
            case 'lesson_completed':
              console.log('🎉 Lição concluída:', message.data);
              setLessonProgress(prev => prev ? { 
                ...prev, 
                isCompleted: true, 
                completedAt: message.data.completedAt ? 
                  (typeof message.data.completedAt === 'string' ? message.data.completedAt : String(message.data.completedAt))
                  : new Date().toISOString()
              } : null);
              break;
              
            case 'quiz_result':
              console.log('📝 Resultado do quiz:', message.data);
              setQuizResult(message.data as unknown as QuizResult);
              break;
              
            case 'new_comment':
              console.log('💬 Novo comentário:', message.data);
              setNewComment(message.data as unknown as LessonComment);
              break;
              
            case 'comment_sent':
              console.log('✅ Comentário enviado:', message.data);
              break;
              
            case 'error':
              console.error('❌ Erro do WebSocket:', message.data.message);
              setError(typeof message.data.message === 'string' ? message.data.message : 'Erro desconhecido');
              break;
              
            case 'pong':
              console.log('🏓 Pong recebido');
              break;
              
            default:
              console.log('📨 Mensagem não tratada:', message);
          }
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        setIsConnected(false);
        setConnectionState('disconnected');
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Não foi possível reconectar. Verifique sua conexão.');
          setConnectionState('error');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
        setConnectionState('error');
        setError('Erro na conexão WebSocket');
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      setConnectionState('error');
      setError('Falha ao estabelecer conexão WebSocket');
    }
  }, [token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Disconnect requested');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket não está conectado');
      setError('Conexão WebSocket não está ativa');
    }
  }, []);

  const joinLesson = useCallback((lessonId: string, courseId: string) => {
    sendMessage({
      type: 'join_lesson',
      data: { lessonId, courseId }
    });
  }, [sendMessage]);

  const updateVideoProgress = useCallback((watchTime: number) => {
    sendMessage({
      type: 'video_progress',
      data: { watchTime }
    });
  }, [sendMessage]);

  const completeLesson = useCallback(() => {
    sendMessage({
      type: 'complete_lesson',
      data: {}
    });
  }, [sendMessage]);

  const submitQuiz = useCallback((answers: Array<{ questionId: string; selectedOptionId?: string; timeSpent: number }>) => {
    sendMessage({
      type: 'quiz_submit',
      data: { answers }
    });
  }, [sendMessage]);

  const sendComment = useCallback((content: string) => {
    sendMessage({
      type: 'send_comment',
      data: { content }
    });
  }, [sendMessage]);

  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping', data: {} });
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionState,
    joinLesson,
    updateVideoProgress,
    completeLesson,
    submitQuiz,
    sendComment,
    lastMessage,
    lessonProgress,
    quizResult,
    newComment,
    error
  };
};

