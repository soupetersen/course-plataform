import { Link } from "react-router-dom";
import { Plus, BookOpen, Users, TrendingUp, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { Course } from "../../types/api";

interface InstructorSectionProps {
  courses: Course[];
}

export const InstructorSection = ({ courses }: InstructorSectionProps) => {
  const totalStudents = courses.reduce(
    (sum, course) => sum + (course.enrollments_count || 0),
    0
  );
  const publishedCourses = courses.filter(
    (course) => course.status === "PUBLISHED"
  ).length;
  const totalRevenue = courses.reduce(
    (sum, course) => sum + course.price * (course.enrollments_count || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Área do Instrutor
          </h2>
          <p className="text-gray-600">
            Gerencie seus cursos e acompanhe seu desempenho
          </p>
        </div>
        <Link to="/courses/create">
          <Button className="bg-primary hover:bg-secondary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Curso
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Cursos Publicados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {publishedCourses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalRevenue.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Você ainda não criou nenhum curso
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro curso e compartilhe seu conhecimento
              </p>
              <Link to="/courses/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Curso
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {course.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge
                          variant={
                            course.status === "PUBLISHED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {course.status === "PUBLISHED"
                            ? "Publicado"
                            : course.status === "DRAFT"
                            ? "Rascunho"
                            : "Arquivado"}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {course.enrollments_count || 0} alunos
                        </span>
                        <span className="text-sm text-gray-600">
                          R$ {course.price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to={`/course/${course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Link to={`/course/${course.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {courses.length > 3 && (
                <div className="text-center pt-4">
                  <Link to="/instructor/courses">
                    <Button variant="outline">
                      Ver Todos os Cursos ({courses.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

