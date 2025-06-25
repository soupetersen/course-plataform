import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Send, User } from "lucide-react";
import {
  useLessonComments,
  useAddLessonComment,
} from "@/hooks/useLessonComments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

interface LessonCommentsProps {
  lessonId: string;
}

export const LessonComments: React.FC<LessonCommentsProps> = ({ lessonId }) => {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useLessonComments(lessonId);
  const addCommentMutation = useAddLessonComment();
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !user) return;

    try {
      await addCommentMutation.mutateAsync({
        lessonId,
        data: { content: newComment.trim() },
      });
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
      {/* Título da seção */}
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <MessageCircle className="w-5 h-5" />
        Comentários ({comments.length})
      </div>

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
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {addCommentMutation.isPending ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </form>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
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
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              {/* Cabeçalho do comentário */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {comment.user.name}
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
              <div className="text-gray-700 leading-relaxed pl-11">
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
