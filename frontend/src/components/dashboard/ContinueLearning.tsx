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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Continue Aprendendo
        </h2>
        <Link to="/courses">
          <Button variant="outline">Ver todos os cursos</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.slice(0, 3).map((enrollment) => (
          <Card
            key={enrollment.id}
            className="hover:shadow-lg transition-shadow duration-200 group fade-in-up"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{enrollment.course.level}</Badge>
                <div className="text-sm text-gray-500">
                  {enrollment.progress}% completo
                </div>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {enrollment.course.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {enrollment.course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {enrollment.course.enrollments?.length || 0} estudantes
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {enrollment.course.modules?.length || 0} módulos
                  </div>
                </div>

                <Link to={`/courses/${enrollment.course.id}`}>
                  <Button className="w-full hover:bg-primary/90 transition-colors">
                    <Play className="h-4 w-4 mr-2" />
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
