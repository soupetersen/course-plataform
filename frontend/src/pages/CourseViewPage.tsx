import { useParams, Link, useNavigate } from "react-router-dom";
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
import { useCourseRatingStats } from "../hooks/useReviews";
import { useMyEnrollments } from "../hooks/useCategoriesAndEnrollments";
import { getLevelText, getLevelColor } from "../lib/utils";

export const CourseViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: courseData } = useCourse(id!);
  const { data: user } = useCurrentUser();
  const { data: ratingStatsData } = useCourseRatingStats(id!);
  const { data: enrollmentsData } = useMyEnrollments();

  const course = courseData?.data;
  const ratingStats = ratingStatsData?.data;
  const enrollments = enrollmentsData?.data || [];

  const isEnrolled = enrollments.some(
    (enrollment) => enrollment.courseId === id
  );

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  const isInstructor = user?.id === course.instructorId;

  const totalLessons =
    course.modules?.reduce(
      (acc, module) => acc + (module.lessons?.length || 0),
      0
    ) || 0;
  const totalDuration =
    course.modules?.reduce(
      (acc, module) =>
        acc +
        (module.lessons?.reduce(
          (lessonAcc, lesson) => lessonAcc + (lesson.duration || 0),
          0
        ) || 0),
      0
    ) || 0;
  const totalDurationHours = Math.floor(totalDuration / 3600);
  const totalDurationMinutes = Math.floor((totalDuration % 3600) / 60);

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
                </Badge>{" "}
                <Badge className={getLevelColor(course.level)}>
                  {getLevelText(course.level)}
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
              <p className="text-gray-600 text-lg mb-4">{course.description}</p>{" "}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {(course.enrollments?.length || 0) > 0
                    ? `${course.enrollments?.length} alunos`
                    : "Sem alunos"}
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {(course.modules?.length || 0) > 0
                    ? `${course.modules?.length} módulos`
                    : "Sem módulos"}
                </div>
                <div className="flex items-center">
                  <Play className="w-4 h-4 mr-1" />
                  {totalLessons} aulas
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {totalDurationHours > 0
                    ? `${totalDurationHours}h ${totalDurationMinutes}m`
                    : `${totalDurationMinutes}m`}{" "}
                  de conteúdo
                </div>{" "}
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  {ratingStats
                    ? `${ratingStats.averageRating.toFixed(1)} (${
                        ratingStats.totalReviews
                      } avaliações)`
                    : "Sem avaliações"}
                </div>
              </div>
            </div>{" "}
            <div className="ml-8">
              {isInstructor ? (
                <Button asChild>
                  <Link to={`/course/${id}/edit`}>Editar Curso</Link>
                </Button>
              ) : isEnrolled ? (
                <div className="text-right">
                  <div className="mb-4">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Você já está matriculado
                    </Badge>
                  </div>
                  <Button
                    size="lg"
                    className="bg-[#FF204E] hover:bg-[#A0153E] text-white"
                    onClick={() => navigate(`/learn/${id}`)}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Continuar Aprendendo
                  </Button>
                </div>
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
                    onClick={() => {
                      if (!user) {
                        navigate(`/login?redirect=/course/${id}`);
                        return;
                      }
                      navigate(`/checkout/${id}`);
                    }}
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
                      className="w-full h-full object-contain rounded-lg"
                    />
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
            </Card>{" "}
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
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 p-4 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-lg">
                                {index + 1}. {module.title}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {module.lessons?.length || 0} aulas
                              </Badge>
                              <Badge variant="outline">
                                {module.lessons?.reduce(
                                  (acc, lesson) => acc + (lesson.duration || 0),
                                  0
                                )}{" "}
                                min
                              </Badge>
                            </div>
                          </div>{" "}
                        </div>

                        {module.lessons && module.lessons.length > 0 && (
                          <div className="divide-y divide-gray-100">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-[#FF204E] text-white rounded-full flex items-center justify-center text-sm font-medium">
                                      {lessonIndex + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <h4 className="font-medium text-gray-900">
                                          {lesson.title}
                                        </h4>
                                        {lesson.isPreview && (
                                          <Badge
                                            variant="outline"
                                            className="text-green-600 border-green-600"
                                          >
                                            Preview
                                          </Badge>
                                        )}
                                        {lesson.isLocked && (
                                          <Badge
                                            variant="outline"
                                            className="text-orange-600 border-orange-600"
                                          >
                                            Bloqueada
                                          </Badge>
                                        )}
                                      </div>
                                      {lesson.description && (
                                        <p className="text-sm text-gray-500 mt-1">
                                          {lesson.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <Play className="w-4 h-4 mr-1" />
                                      {lesson.type || "Vídeo"}
                                    </div>
                                    {lesson.duration && (
                                      <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {Math.floor(lesson.duration / 60)}:
                                        {(lesson.duration % 60)
                                          .toString()
                                          .padStart(2, "0")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {(!module.lessons || module.lessons.length === 0) && (
                          <div className="p-4 text-center text-gray-500">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">
                              Este módulo ainda não possui aulas.
                            </p>
                          </div>
                        )}
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
              </CardHeader>{" "}
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Alunos inscritos</span>
                  <span className="font-medium">
                    {(course.enrollments?.length || 0) > 0
                      ? course.enrollments?.length
                      : "Nenhum"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Módulos</span>
                  <span className="font-medium">
                    {(course.modules?.length || 0) > 0
                      ? course.modules?.length
                      : "Nenhum"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de aulas</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração total</span>
                  <span className="font-medium">
                    {totalDurationHours > 0
                      ? `${totalDurationHours}h ${totalDurationMinutes}m`
                      : `${totalDurationMinutes}m`}
                  </span>
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
