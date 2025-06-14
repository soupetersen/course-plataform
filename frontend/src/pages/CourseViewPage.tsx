import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Clock, Users, Star, BookOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useCourse } from "../hooks/useCourses";
import { useCurrentUser } from "../hooks/useAuth";

export const CourseViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: courseData } = useCourse(id!);
  const { data: user } = useCurrentUser();

  const course = courseData?.data;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isInstructor = user?.id === course.instructorId;
  const levelLabels = {
    BEGINNER: "Iniciante",
    INTERMEDIATE: "Intermediário",
    ADVANCED: "Avançado",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            to="/courses"
            className="inline-flex items-center text-gray-600 hover:text-[#FF204E] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Cursos
          </Link>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">
                  {course.category?.name || "Sem categoria"}
                </Badge>
                <Badge variant="outline">
                  {levelLabels[course.level as keyof typeof levelLabels]}
                </Badge>
                <Badge
                  variant={
                    course.status === "PUBLISHED" ? "default" : "secondary"
                  }
                >
                  {course.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>

              <p className="text-gray-600 text-lg mb-4">{course.description}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrollments?.length || 0} alunos
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {course.modules?.length || 0} módulos
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration || 0}h de conteúdo
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  4.8 (324 avaliações)
                </div>
              </div>
            </div>

            <div className="ml-8">
              {isInstructor ? (
                <Button asChild>
                  <Link to={`/course/${id}/edit`}>Editar Curso</Link>
                </Button>
              ) : (
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#FF204E] mb-2">
                    {course.price === 0
                      ? "Gratuito"
                      : `R$ ${course.price.toFixed(2)}`}
                  </div>
                  <Button
                    size="lg"
                    className="bg-[#FF204E] hover:bg-[#A0153E] text-white"
                  >
                    Inscrever-se
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {course.imageUrl && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                      <Button
                        size="lg"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/50"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Assistir Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Sobre este curso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {course.description || "Nenhuma descrição disponível."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Curso</CardTitle>
              </CardHeader>
              <CardContent>
                {course.modules && course.modules.length > 0 ? (
                  <div className="space-y-4">
                    {course.modules.map((module, index) => (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {index + 1}. {module.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {module.description}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {module.lessons?.length || 0} aulas
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Este curso ainda não possui módulos.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-6">
            {}
            <Card>
              <CardHeader>
                <CardTitle>Instrutor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {course.instructor?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {course.instructor?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {course.instructor?.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Alunos inscritos</span>
                  <span className="font-medium">
                    {course.enrollments?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Módulos</span>
                  <span className="font-medium">
                    {course.modules?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração total</span>
                  <span className="font-medium">{course.duration || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Criado em</span>
                  <span className="font-medium">
                    {course.createdAt
                      ? new Date(course.createdAt).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Conhecimento básico de informática</li>
                  <li>• Acesso à internet</li>
                  <li>• Dedicação para estudar</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
