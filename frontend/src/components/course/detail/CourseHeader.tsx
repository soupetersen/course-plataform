import { Badge } from "../../ui/badge";
import { BookOpen, Clock, Users, Star } from "lucide-react";
import type { Course } from "../../../types/api";

interface CourseHeaderProps {
  course: Course;
  totalLessons: number;
  totalDuration: number;
}

export const CourseHeader = ({
  course,
  totalLessons,
  totalDuration,
}: CourseHeaderProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "Iniciante";
      case "INTERMEDIATE":
        return "Intermediário";
      case "ADVANCED":
        return "Avançado";
      default:
        return level;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-4 animate-slide-in-left">
      {" "}
      <div className="flex items-center space-x-2">
        <Badge className={getLevelColor(course.level)}>
          {getLevelText(course.level)}
        </Badge>
        {course.category && (
          <>
            <span className="text-sm text-gray-600">•</span>
            <span className="text-sm text-gray-600">
              {course.category.name}
            </span>
          </>
        )}
      </div>
      <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
      <p className="text-xl text-gray-600">{course.description}</p>
      <div className="flex items-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {course.enrollments?.length || 0} estudantes
        </div>
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-1" />
          {totalLessons} aulas
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {formatDuration(totalDuration)}
        </div>
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1" />
          4.8 (234 avaliações)
        </div>
      </div>{" "}
      <div className="flex items-center space-x-4">
        {course.instructor?.avatar ? (
          <img
            src={course.instructor.avatar}
            alt={course.instructor.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
            {course.instructor?.name?.charAt(0).toUpperCase() || "I"}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">
            {course.instructor?.name || "Instrutor"}
          </p>
          <p className="text-sm text-gray-600">Instrutor</p>
        </div>
      </div>
    </div>
  );
};
