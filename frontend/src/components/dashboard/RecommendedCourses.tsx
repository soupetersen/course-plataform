import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../../types/api";

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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2">
                  <div className="h-2 sm:h-3 bg-gray-200 rounded"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="course-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="course-card hover:shadow-lg transition-all duration-200 group animate-slide-in-left flex flex-col h-full"
            >
              <CardHeader className="card-header pb-3 p-3 sm:p-4 lg:p-6 sm:pb-3 flex-1">
                {course.imageUrl && (
                  <div className="image-container">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="badge-responsive">
                    {course.level}
                  </Badge>
                  <div className="price-display price-display-sm sm:price-display-md text-primary">
                    R$ {course.price.toFixed(2)}
                  </div>
                </div>{" "}
                <CardTitle className="group-hover:text-primary transition-colors text-sm md:text-base lg:text-lg leading-tight hyphens-auto break-words min-h-[2.5rem] md:min-h-[3rem] mb-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm leading-relaxed break-words flex-1">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content p-3 sm:p-4 lg:p-6 pt-0 mt-auto">
                <div className="space-y-3">
                  <div className="card-stats">
                    <div className="flex items-center min-w-0 flex-1">
                      <Users className="stats-icon" />
                      <span className="truncate text-xs sm:text-sm text-gray-600">
                        {course.enrollments?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center min-w-0 flex-1 justify-end">
                      <BookOpen className="stats-icon" />
                      <span className="truncate text-xs sm:text-sm text-gray-600">
                        {course.modules?.length || 0} módulos
                      </span>
                    </div>
                  </div>

                  <Link to={`/courses/${course.id}`} className="block">
                    <Button
                      variant="outline"
                      className="btn-responsive w-full group-hover:scale-105 transition-transform"
                    >
                      Ver detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
