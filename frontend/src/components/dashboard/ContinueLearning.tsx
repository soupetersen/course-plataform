import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { BookOpen, Users, Play } from "lucide-react";
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
      <div className="course-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {enrollments.slice(0, 3).map((enrollment) => (
          <Card
            key={enrollment.id}
            className="course-card hover:shadow-lg transition-shadow duration-200 group fade-in-up flex flex-col h-full"
          >
            <CardHeader className="card-header pb-3 p-3 sm:p-4 lg:p-6 sm:pb-3 flex-1">              <div className="flex items-center justify-between mb-2">
                <Badge className={`badge-responsive ${getLevelColor(enrollment.course.level)}`}>
                  {getLevelText(enrollment.course.level)}
                </Badge>
                <div className="text-xs sm:text-sm text-gray-500">
                  {enrollment.progress}% completo
                </div>
              </div>{" "}
              <CardTitle className="group-hover:text-primary transition-colors text-sm md:text-base lg:text-lg leading-tight hyphens-auto break-words min-h-[2.5rem] md:min-h-[3rem] mb-2">
                {enrollment.course.title}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm leading-relaxed break-words flex-1">
                {enrollment.course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content p-3 sm:p-4 lg:p-6 pt-0 mt-auto">
              <div className="space-y-3">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>

                <div className="card-stats">
                  <div className="flex items-center min-w-0 flex-1">
                    <Users className="stats-icon" />
                    <span className="truncate text-xs sm:text-sm text-gray-600">
                      {enrollment.course.enrollments?.length || 0} estudantes
                    </span>
                  </div>
                  <div className="flex items-center min-w-0 flex-1 justify-end">
                    <BookOpen className="stats-icon" />
                    <span className="truncate text-xs sm:text-sm text-gray-600">
                      {enrollment.course.modules?.length || 0} módulos
                    </span>
                  </div>
                </div>

                <Link to={`/courses/${enrollment.course.id}`} className="block">
                  <Button className="btn-responsive w-full hover:bg-primary/90 transition-colors">
                    <Play className="stats-icon" />
                    Continuar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
