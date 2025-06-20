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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      className={`grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      }`}
    >
      {courses.map((course) => (
        <Card
          key={course.id}
          className="hover:shadow-lg transition-all duration-200 group animate-slide-in-left"
        >
          <CardHeader className="pb-3">
            {course.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge className={getLevelColor(course.level)}>
                {getLevelText(course.level)}
              </Badge>
              <div className="text-lg font-bold text-primary">
                R$ {course.price.toFixed(2)}
              </div>
            </div>
            <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {course.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {" "}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.enrollments?.length || 0} estudantes
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {course.modules?.length || 0} módulos
                </div>
              </div>
              {course.averageRating && course.averageRating > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-yellow-600">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    <span className="font-medium">
                      {course.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({course.reviewCount || 0} avaliações)
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Instrutor:</span>
                <span className="ml-1">
                  {course.instructor?.name || "Instrutor não informado"}
                </span>
              </div>
              <Link to={`/course/${course.id}`}>
                <Button className="w-full group-hover:scale-105 transition-transform">
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
