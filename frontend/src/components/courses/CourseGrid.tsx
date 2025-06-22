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
      {courses.map((course) => (
        <Card
          key={course.id}
          className="hover:shadow-lg transition-all duration-200 group animate-slide-in-left flex flex-col h-full"
        >
          <CardHeader className="pb-3 p-3 sm:p-4 lg:p-6 flex-1">
            {course.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
            <div className="flex items-center justify-between mb-2 gap-2">
              <Badge
                className={`${getLevelColor(
                  course.level
                )} text-xs px-2 py-1 flex-shrink-0`}
              >
                {getLevelText(course.level)}
              </Badge>
              {course.status !== "PUBLISHED" && (
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-600 border-orange-200 text-xs px-2 py-1 flex-shrink-0"
                >
                  Rascunho
                </Badge>
              )}
              <div className="text-xs sm:text-sm lg:text-base font-bold text-primary flex-shrink-0">
                R$ {course.price.toFixed(2)}
              </div>
            </div>
            <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base lg:text-lg leading-tight mb-2">
              {course.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 text-xs sm:text-sm leading-relaxed flex-1">
              {course.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 mt-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                <div className="flex items-center min-w-0 flex-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {(course.enrollments?.length || 0) > 0
                      ? `${course.enrollments.length} estudantes`
                      : "Sem estudantes"}
                  </span>
                </div>
                <div className="flex items-center min-w-0 flex-1 justify-end">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {(course.modules?.length || 0) > 0
                      ? `${course.modules.length} módulos`
                      : "Sem módulos"}
                  </span>
                </div>
              </div>
              {course.averageRating && course.averageRating > 0 && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center text-yellow-600 min-w-0 flex-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 fill-current flex-shrink-0" />
                    <span className="font-medium mr-1">
                      {course.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 truncate">
                      (
                      {(course.reviewCount || 0) > 0
                        ? `${course.reviewCount} avaliações`
                        : "Sem avaliações"}
                      )
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <span className="font-medium flex-shrink-0">Instrutor:</span>
                <span className="ml-1 truncate">
                  {course.instructor?.name || "Instrutor não informado"}
                </span>
              </div>
              <Link to={`/course/${course.id}`} className="block">
                <Button className="w-full group-hover:scale-105 transition-transform text-xs sm:text-sm py-2 h-auto">
                  Ver curso
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
