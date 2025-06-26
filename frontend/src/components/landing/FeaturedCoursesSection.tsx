import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { BookOpen, Star, Users, Clock, ArrowRight } from "lucide-react";
import { useCourses } from "../../hooks/useCourses";
import { getLevelText, getLevelColor } from "../../lib/utils";

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
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-800">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Cursos em Destaque
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nossos cursos mais populares escolhidos por milhares de estudantes
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="course-card animate-pulse flex flex-col h-full animate-in zoom-in-95 fade-in duration-500"
                  style={{ animationDelay: `${index * 150 + 200}ms` }}
                >
                  <div className="w-full h-40 sm:h-48 bg-gray-200"></div>
                  <CardContent className="p-4 sm:p-6 flex-1">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 sm:h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between mt-auto">
                      <div className="h-6 sm:h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 sm:h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : courses.map((course, index) => (
                <Card
                  key={course.id}
                  className="course-card flex flex-col h-full hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in zoom-in-95 fade-in group"
                  style={{ animationDelay: `${index * 150 + 300}ms` }}
                >
                  <div className="relative">
                    <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                      )}
                    </div>{" "}
                    <Badge
                      className={`absolute top-2 sm:top-4 left-2 sm:left-4 text-xs px-2 py-1 max-w-[calc(100%-4rem)] truncate ${getLevelColor(
                        course.level
                      )}`}
                    >
                      {getLevelText(course.level)}
                    </Badge>
                    {course.price > 0 && (
                      <Badge className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500 text-white text-xs px-2 py-1 whitespace-nowrap">
                        R$ {course.price.toFixed(2).replace(".", ",")}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4 sm:p-6 flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-1 flex-shrink-0"
                      >
                        <Clock className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        <span className="whitespace-nowrap">
                          {course.duration ? `${course.duration}h` : "N/A"}
                        </span>
                      </Badge>
                      {course.averageRating && (
                        <div className="flex items-center flex-shrink-0">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm text-muted-foreground ml-1">
                            {course.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>{" "}
                    <h3 className="text-sm md:text-base lg:text-lg font-semibold text-foreground mb-2 leading-tight hyphens-auto break-words min-h-[2.5rem] md:min-h-[3rem]">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 break-words leading-relaxed">
                      Por {course.instructor?.name || "Instrutor não informado"}
                    </p>
                    <div className="flex items-center text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                      <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                      <span className="break-words">
                        {course.enrollments_count || 0} estudantes
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto gap-2">
                      <div className="order-2 sm:order-1">
                        {course.price > 0 ? (
                          <span className="text-base md:text-lg lg:text-xl font-bold text-primary break-words">
                            R$ {course.price.toFixed(2).replace(".", ",")}
                          </span>
                        ) : (
                          <span className="text-base md:text-lg lg:text-xl font-bold text-green-600 break-words">
                            Gratuito
                          </span>
                        )}
                      </div>{" "}
                      <Link
                        to={`/course/${course.id}`}
                        className="order-1 sm:order-2 w-full sm:w-auto"
                      >
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-secondary text-white text-xs md:text-sm py-2 px-3 md:px-4 h-auto w-full sm:w-auto group-hover:scale-105 transition-transform"
                        >
                          Ver Curso
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>{" "}
        <div className="text-center mt-12 animate-in slide-in-from-bottom-6 fade-in duration-600 delay-1000">
          <Link to="/courses">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all group"
            >
              Ver Todos os Cursos
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

