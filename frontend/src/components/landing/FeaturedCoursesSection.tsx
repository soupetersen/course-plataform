import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { BookOpen, Star, Users, Clock, ArrowRight } from "lucide-react";
import { useCourses } from "../../hooks/useCourses";

export const FeaturedCoursesSection = () => {
  const { data: coursesData, isLoading } = useCourses({
    limit: 3,
    page: 1,
    status: "PUBLISHED",
  });

  
  const courses = coursesData?.data ?? [];

  return (
    <section id="cursos" className="section-padding hero-gradient">
      <div className="container">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Cursos em Destaque
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nossos cursos mais populares escolhidos por milhares de estudantes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? 
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="course-card fade-in-up animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : courses.map((course) => (
                <Card key={course.id} className="course-card fade-in-up">
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-white" />
                      )}
                    </div>
                    <Badge className="absolute top-4 left-4 bg-white text-primary">
                      {course.level === "BEGINNER"
                        ? "Iniciante"
                        : course.level === "INTERMEDIATE"
                        ? "IntermediÃ¡rio"
                        : "AvanÃ§ado"}
                    </Badge>
                    {course.price > 0 && (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                        R$ {course.price.toFixed(2).replace(".", ",")}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration ? `${course.duration}h` : "N/A"}
                      </Badge>
                      {course.average_rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-muted-foreground ml-1">
                            {course.average_rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {course.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4">
                      Por {course.instructor.name}
                    </p>

                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrollments_count || 0} alunos
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {course.price > 0 ? (
                          <span className="text-2xl font-bold text-primary">
                            R$ {course.price.toFixed(2).replace(".", ",")}
                          </span>
                        ) : (
                          <span className="text-2xl font-bold text-green-600">
                            Gratuito
                          </span>
                        )}
                      </div>
                      <Link to={`/course/${course.id}`}>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-secondary text-white"
                        >
                          Ver Curso
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="text-center mt-12 fade-in-up">
          <Link to="/courses">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Ver Todos os Cursos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
