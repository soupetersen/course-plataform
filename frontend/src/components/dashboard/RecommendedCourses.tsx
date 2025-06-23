import { Card, CardDescription, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../../types/api";
import { getLevelText, getLevelColor } from "../../lib/utils";

interface RecommendedCoursesProps {
  courses: Course[];
  isLoading: boolean;
}

export const RecommendedCourses = ({
  courses,
  isLoading,
}: RecommendedCoursesProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Cursos Recomendados
        </h2>
        <Link to="/courses">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Explorar mais
          </Button>
        </Link>
      </div>{" "}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              variant="elevated"
              padding="none"
              className="animate-pulse overflow-hidden"
            >
              <div className="aspect-video bg-gray-200 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-9 bg-gray-200 rounded w-full"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="course-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {courses.map((course, index) => (
            <Card
              key={course.id}
              variant="elevated"
              padding="none"
              className="course-card group overflow-hidden flex flex-col h-full hover:scale-[1.02] transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {course.imageUrl && (
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              )}

              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-center justify-between mb-3">
                  {" "}
                  <Badge
                    className={`text-xs font-medium transition-colors ${getLevelColor(
                      course.level
                    )}`}
                  >
                    {getLevelText(course.level)}
                  </Badge>
                  <span className="text-lg font-bold text-green-600">
                    R$ {course.price.toFixed(2)}
                  </span>
                </div>{" "}
                <CardTitle className="group-hover:text-primary transition-colors duration-200 text-base md:text-lg leading-tight mb-2 line-clamp-2 min-h-[3rem]">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                  {course.description}
                </CardDescription>
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
                <Link to={`/courses/${course.id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200"
                  >
                    Ver detalhes
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
