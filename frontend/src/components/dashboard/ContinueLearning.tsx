import { Card, CardDescription, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { BookOpen, Users, Play, User } from "lucide-react";
import { getLevelText, getLevelColor } from "../../lib/utils";
import { Link } from "react-router-dom";
import type { Enrollment } from "../../types/api";

interface ContineLearningProps {
  enrollments: Enrollment[];
}

export const ContinueLearning = ({ enrollments }: ContineLearningProps) => {
  if (enrollments.length === 0) {
    return null;
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Continue Aprendendo
        </h2>
        <Link to="/courses">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Ver todos os cursos
          </Button>
        </Link>
      </div>{" "}
      <div className="course-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {enrollments
          .filter((enrollment) => enrollment.course && enrollment.course.id)
          .slice(0, 4)
          .map((enrollment) => (
            <Card
              key={enrollment.id}
              variant="elevated"
              padding="none"
              className="course-card group overflow-hidden flex flex-col h-full hover:scale-[1.02] transition-all duration-300"
            >
              
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                {enrollment.course?.imageUrl ? (
                  <img
                    src={enrollment.course.imageUrl}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                  <div className="flex items-center justify-between text-white text-sm">
                    <span>{enrollment.progress}% completo</span>
                    {enrollment.course?.level && (
                      <Badge
                        className={`${getLevelColor(
                          enrollment.course.level
                        )} text-xs`}
                      >
                        {getLevelText(enrollment.course.level)}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full h-full transition-all duration-500 ease-out"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1 p-4">
                
                {enrollment.course?.category && (
                  <div className="flex items-center mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {enrollment.course.category.name}
                    </Badge>
                  </div>
                )}
                <CardTitle className="group-hover:text-primary transition-colors duration-200 text-base md:text-lg leading-tight mb-2 line-clamp-2 min-h-[3rem]">
                  {enrollment.course?.title || "Título não disponível"}
                </CardTitle>
                
                {enrollment.course?.instructor && (
                  <div className="flex items-center text-xs text-gray-600 mb-3">
                    <User className="w-3 h-3 mr-1" />
                    <span>Por {enrollment.course.instructor.name}</span>
                  </div>
                )}
                <CardDescription className="text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                  {enrollment.course?.description || "Descrição não disponível"}
                </CardDescription>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {enrollment.course?.enrollments?.length || 0} estudantes
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {enrollment.course?.modules?.length || 0} módulos
                    </span>
                  </div>
                </div>{" "}
                <Link
                  to={`/learn/${enrollment.course?.id || ""}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continuar Aprendendo
                  </Button>{" "}
                </Link>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
};

