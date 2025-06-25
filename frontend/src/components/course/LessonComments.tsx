import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Send, Wifi, WifiOff } from "lucide-react";
import { useLessonCommentsRealtime } from "@/hooks/useLessonCommentsRealtime";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import "@/styles/comments.css";

interface LessonCommentsProps {
  lessonId: string;
}

export const LessonComments: React.FC<LessonCommentsProps> = ({ lessonId }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("authToken") || "";

  const { comments, isLoading, isSubmitting, addComment, isConnected, error } =
    useLessonCommentsRealtime({ lessonId, token });

  const [newComment, setNewComment] = useState("");
  const [recentCommentIds, setRecentCommentIds] = useState<Set<string>>(
    new Set()
  );
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll para o último comentário
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (comments.length > 0) {
      scrollToBottom();
    }
  }, [comments]);

  // Marcar comentários como recentes por 3 segundos
  useEffect(() => {
    if (comments.length > 0) {
      const lastComment = comments[comments.length - 1];
      const commentAge = Date.now() - new Date(lastComment.createdAt).getTime();

      // Se o comentário foi criado há menos de 5 segundos, é considerado recente
      if (commentAge < 5000) {
        setRecentCommentIds((prev) => new Set([...prev, lastComment.id]));

        // Remover da lista de recentes após 3 segundos
        setTimeout(() => {
          setRecentCommentIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(lastComment.id);
            return newSet;
          });
        }, 3000);
      }
    }
  }, [comments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !user) return;

    try {
      await addComment(newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MessageCircle className="w-5 h-5" />
          Comentários
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título da seção com status de conexão */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MessageCircle className="w-5 h-5" />
          Comentários ({comments.length})
        </div>

        {/* Indicador de status da conexão */}
        <div
          className={`flex items-center gap-2 text-sm connection-status ${
            isConnected ? "connected" : "disconnected"
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Tempo real ativo</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-orange-500 animate-pulse-slow" />
              <span className="text-orange-600">Reconectando...</span>
            </>
          )}
        </div>
      </div>

      {/* Erro de conexão */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">
            {typeof error === "string" ? error : error.message}
          </p>
        </div>
      )}

      {/* Formulário para novo comentário */}
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="new-comment"
              className="text-sm font-medium text-gray-700"
            >
              Adicionar comentário
            </label>
            <Textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Compartilhe suas dúvidas ou reflexões sobre esta lição..."
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || isSubmitting || !isConnected}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </form>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4 max-h-96 overflow-y-auto comments-container">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">Nenhum comentário ainda</p>
            <p className="text-sm">
              {user
                ? "Seja o primeiro a comentar!"
                : "Faça login para comentar."}
            </p>
          </div>
        ) : (
          <>
            {comments.map((comment) => {
              const isOwnComment = user?.id === comment.userId;
              const isRecentComment = recentCommentIds.has(comment.id);

              return (
                <div
                  key={comment.id}
                  className={`bg-white border border-gray-200 rounded-lg p-4 space-y-3 comment-item ${
                    isOwnComment ? "own-comment" : ""
                  } ${
                    isRecentComment
                      ? "animate-fade-in-slide animate-new-comment"
                      : "animate-fade-in"
                  }`}
                >
                  {/* Cabeçalho do comentário */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {comment.user.avatar ? (
                        <AvatarImage
                          src={comment.user.avatar}
                          alt={comment.user.name}
                        />
                      ) : null}
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {comment.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isOwnComment ? "text-blue-700" : "text-gray-900"
                          }`}
                        >
                          {comment.user.name}
                          {isOwnComment && (
                            <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                              Você
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do comentário */}
                  <div className="text-gray-700 leading-relaxed ml-11">
                    {comment.content}
                  </div>
                </div>
              );
            })}
            {/* Referência para scroll automático */}
            <div ref={commentsEndRef} />
          </>
        )}
      </div>
    </div>
  );
};
