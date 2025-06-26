import { useParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import LessonViewer from "@/components/course/LessonViewer";

export function LessonPage() {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();

  // Por enquanto, usar localStorage. Em produção, isso viria do contexto de auth
  const token = localStorage.getItem("authToken") || "";

  if (!lessonId || !courseId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Parâmetros inválidos
        </h2>
        <p className="text-gray-600">Lição ou curso não encontrado.</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Não autenticado
        </h2>
        <p className="text-gray-600">
          Você precisa estar logado para acessar esta lição.
        </p>
      </div>
    );
  }
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LessonViewer lessonId={lessonId} courseId={courseId} token={token} />
      </div>
    </ProtectedRoute>
  );
}
