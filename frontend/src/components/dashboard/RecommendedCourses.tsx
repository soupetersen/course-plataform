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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Cursos Recomendados
        </h2>
        <Link to="/courses">
          <Button variant="outline">Explorar mais</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Badge variant="secondary">{course.level}</Badge>
                  <div className="text-sm font-semibold text-primary">
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
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrollments?.length || 0}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.modules?.length || 0} módulos
                    </div>
                  </div>

                  <Link to={`/courses/${course.id}`}>
                    <Button
                      variant="outline"
                      className="w-full group-hover:scale-105 transition-transform"
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
