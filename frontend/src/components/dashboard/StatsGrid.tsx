import { Card, CardContent } from "../ui/card";
import { BookOpen, Clock, Star, TrendingUp } from "lucide-react";
import type { Enrollment } from "../../types/api";

interface StatsGridProps {
  enrollments: Enrollment[];
}

export const StatsGrid = ({ enrollments }: StatsGridProps) => {
  const stats = [
    {
      title: "Cursos Inscritos",
      value: enrollments.length,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Horas de Estudo",
      value: "24h",
      icon: Clock,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Certificados",
      value: enrollments.filter((e) => e.completedAt).length,
      icon: Star,
      color: "text-tertiary",
      bgColor: "bg-tertiary/10",
    },
    {
      title: "Progresso Médio",
      value: `${Math.round(
        enrollments.reduce((acc, e) => acc + e.progress, 0) /
          enrollments.length || 0
      )}%`,
      icon: TrendingUp,
      color: "text-quaternary",
      bgColor: "bg-quaternary/10",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="hover:shadow-lg transition-shadow duration-200 fade-in-up"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
