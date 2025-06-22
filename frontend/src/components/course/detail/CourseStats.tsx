import { Card, CardContent } from "../../ui/card";
import { Clock, Users, Star, Award } from "lucide-react";
import type { Course } from "../../../types/api";
import { getLevelText } from "../../../lib/utils";

interface CourseStatsProps {
  course: Course;
}

export const CourseStats = ({ course }: CourseStatsProps) => {
  const stats = [
    {
      icon: Clock,
      label: "Duração",
      value: `${course.duration}h`,
      color: "text-blue-600",
    },
    {
      icon: Users,
      label: "Alunos",
      value: course.enrollments_count || 0,
      color: "text-green-600",
    },
    {
      icon: Star,
      label: "Avaliação",
      value: course.averageRating?.toFixed(1) || "0.0",
      color: "text-yellow-600",
    },    {
      icon: Award,
      label: "Nível",
      value: getLevelText(course.level),
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.label} className="animate-slide-in-up">
            <CardContent className="p-4 text-center">
              <IconComponent className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-[#00224D]">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
