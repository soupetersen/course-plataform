import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  Clock,
  CheckCircle,
  PlayCircle,
  Award,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useEnrollmentsByUser } from "@/hooks/useCategoriesAndEnrollments";
import { useAuth } from "@/hooks/useAuth";
import { Enrollment } from "@/types/api";

export function MyLearningPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const { data: enrollmentsResponse, isLoading } = useEnrollmentsByUser(
    user?.id || ""
  );
  const enrollments = enrollmentsResponse?.data || [];

  const filteredEnrollments = enrollments.filter((enrollment: Enrollment) => {
    const course = enrollment.course;
    if (!course) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      course.title?.toLowerCase().includes(searchLower) ||
      course.description?.toLowerCase().includes(searchLower) ||
      course.instructor?.name?.toLowerCase().includes(searchLower)
    );
  });

  const completedCourses = enrollments.filter(
    (enrollment: Enrollment) => enrollment.course && enrollment.progress === 100
  );

  const inProgressCourses = enrollments.filter(
    (enrollment: Enrollment) =>
      enrollment.course && enrollment.progress > 0 && enrollment.progress < 100
  );

  const notStartedCourses = enrollments.filter(
    (enrollment: Enrollment) => enrollment.course && enrollment.progress === 0
  );

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const renderCourseCard = (enrollment: Enrollment) => {
    const course = enrollment.course;

    if (!course) return null;

    return (
      <Card
        key={enrollment.id}
        className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      >
        {/* Imagem do curso - altura reduzida */}
        <div className="h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title || "Curso"}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {/* Header compacto */}
        <CardHeader className="pb-2 pt-3">
          <div className="flex justify-between items-start gap-2 mb-2">
            {/* Badge de categoria - só exibe se tiver dados */}
            {course.category?.name && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {course.category.name}
              </Badge>
            )}
            {/* Badge de conclusão - só exibe se estiver concluído */}
            {enrollment.progress === 100 && (
              <Badge
                variant="default"
                className="text-xs bg-green-500 shrink-0"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluído
              </Badge>
            )}
          </div>

          <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
            {course.title || "Título não disponível"}
          </CardTitle>

          {/* Instrutor */}
          <div className="text-xs text-gray-600">
            por {course.instructor?.name || "Instrutor não definido"}
          </div>
        </CardHeader>

        {/* Content compacto */}
        <CardContent className="pt-0 pb-3">
          {/* Barra de progresso melhorada */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Progresso</span>
              <span className="font-semibold text-gray-900">
                {enrollment.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
          </div>

          {/* Footer com data e botão */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(enrollment.enrolledAt)}</span>
            </div>

            {enrollment.progress > 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-7 px-3 text-xs"
              >
                <PlayCircle className="h-3 w-3" />
                Continuar
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                className="gap-1 h-7 px-3 text-xs"
              >
                <PlayCircle className="h-3 w-3" />
                Começar
              </Button>
            )}
          </div>

          {/* Data de conclusão - só exibe se tiver */}
          {enrollment.completedAt && (
            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Concluído em {formatDate(enrollment.completedAt)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Meu Aprendizado
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Acompanhe seu progresso e continue aprendendo com seus cursos
              inscritos.
            </p>

            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar em meus cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg h-12"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Cursos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground">cursos inscritos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedCourses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                cursos finalizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Em Progresso
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inProgressCourses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                cursos em andamento
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos ({enrollments.length})</TabsTrigger>
            <TabsTrigger value="in-progress">
              Em Progresso ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídos ({completedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="not-started">
              Não Iniciados ({notStartedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.map(renderCourseCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "Nenhum curso encontrado"
                    : "Você ainda não se inscreveu em nenhum curso"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "Tente ajustar seus termos de busca"
                    : "Explore nossa biblioteca de cursos e comece a aprender hoje!"}
                </p>
                {!searchTerm && (
                  <Link to="/courses">
                    <Button>Ver Cursos</Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4 mt-6">
            {inProgressCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressCourses
                  .filter((enrollment: Enrollment) => {
                    const course = enrollment.course;
                    return (
                      course.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      course.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      course.instructor.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    );
                  })
                  .map(renderCourseCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum curso em progresso
                </h3>
                <p className="text-gray-500">
                  Comece um dos seus cursos para vê-lo aqui!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses
                  .filter((enrollment: Enrollment) => {
                    const course = enrollment.course;
                    return (
                      course.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      course.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      course.instructor.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    );
                  })
                  .map(renderCourseCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum curso concluído ainda
                </h3>
                <p className="text-gray-500">
                  Continue estudando para ver seus certificados aqui!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="not-started" className="space-y-4 mt-6">
            {notStartedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notStartedCourses
                  .filter((enrollment: Enrollment) => {
                    const course = enrollment.course;
                    return (
                      course.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      course.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      course.instructor.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    );
                  })
                  .map(renderCourseCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <PlayCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Todos os cursos foram iniciados
                </h3>
                <p className="text-gray-500">
                  Parabéns! Você começou todos os seus cursos inscritos.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
