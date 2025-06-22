import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BookOpen, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../../types/api";

interface CourseGridProps {
  courses: Course[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  onClearFilters: () => void;
}

export const CourseGrid = ({
  courses,
  isLoading,
  viewMode,
  onClearFilters,
}: CourseGridProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "Iniciante";
      case "INTERMEDIATE":
        return "Intermediário";
      case "ADVANCED":
        return "Avançado";
      default:
        return level;
    }
  };

  console.log("Rendering CourseGrid with", {
    courses: courses.length,
    isLoading,
    viewMode,
  });
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse flex flex-col h-full">
            <CardHeader className="p-3 sm:p-4 lg:p-6 flex-1">
              <div className="aspect-video bg-gray-200 rounded mb-3"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 mt-auto">
              <div className="space-y-2">
                <div className="h-2 sm:h-3 bg-gray-200 rounded"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="text-center py-12 fade-in-up">
        <CardContent>
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum curso encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar seus filtros ou buscar por outros termos.
          </p>
          <Button onClick={onClearFilters}>Limpar filtros</Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div
      className={`grid gap-4 sm:gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      }`}
    >
      {" "}
      {courses.map((course, index) => (
        <Card
          key={course.id}
          variant="elevated"
          padding="none"
          className={`course-card group overflow-hidden transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 ${
            viewMode === "grid"
              ? "flex flex-col h-full hover:scale-[1.02]"
              : "flex flex-row h-auto hover:shadow-lg"
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {course.imageUrl ? (
            <div
              className={`relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 ${
                viewMode === "grid" ? "aspect-video" : "w-48 h-32 flex-shrink-0"
              }`}
            >
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ) : (
            <div
              className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${
                viewMode === "grid" ? "aspect-video" : "w-48 h-32 flex-shrink-0"
              }`}
            >
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}

          <div className="flex flex-col flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge
                className={`${getLevelColor(
                  course.level
                )} text-xs font-medium transition-colors`}
              >
                {getLevelText(course.level)}
              </Badge>
              <span className="text-lg font-bold text-green-600">
                {course.price === 0
                  ? "Gratuito"
                  : `R$ ${course.price.toFixed(2)}`}
              </span>
            </div>

            {course.status !== "PUBLISHED" && (
              <div className="mb-3">
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-600 border-orange-200 text-xs px-2 py-1"
                >
                  Rascunho
                </Badge>
              </div>
            )}

            <CardTitle
              className={`group-hover:text-primary transition-colors duration-200 text-base md:text-lg leading-tight mb-2 ${
                viewMode === "grid"
                  ? "line-clamp-2 min-h-[3rem]"
                  : "line-clamp-1"
              }`}
            >
              {course.title}
            </CardTitle>

            <CardDescription
              className={`text-sm leading-relaxed flex-1 mb-4 ${
                viewMode === "grid" ? "line-clamp-3" : "line-clamp-2"
              }`}
            >
              {course.description}
            </CardDescription>

            <div className="text-xs text-gray-600 mb-3">
              <span className="font-medium">por</span>{" "}
              {course.instructor?.name || "Instrutor não informado"}
            </div>

            {course.averageRating && course.averageRating > 0 && (
              <div className="flex items-center text-xs text-gray-600 mb-3">
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                <span className="font-medium mr-1">
                  {course.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({course.reviewCount || 0} avaliações)
                </span>
              </div>
            )}

            {viewMode === "grid" ? (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollments?.length || 0} alunos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.modules?.length || 0} módulos</span>
                  </div>
                </div>

                <Link to={`/course/${course.id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200"
                  >
                    Ver detalhes
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollments?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.modules?.length || 0}</span>
                  </div>
                </div>

                <Link to={`/course/${course.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200"
                  >
                    Ver detalhes
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
