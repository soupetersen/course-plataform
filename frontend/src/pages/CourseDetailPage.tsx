import { useParams, Link } from "react-router-dom";
import { useCourse } from "../hooks/useCourses";
import { useModulesByCourse } from "../hooks/useModulesAndLessons";
import { useAuth } from "../hooks/useAuth";
import { CourseHeader } from "../components/course/detail/CourseHeader";
import { CoursePreview } from "../components/course/detail/CoursePreview";
import { CourseTabs } from "../components/course/detail/CourseTabs";
import { EnrollmentCard } from "../components/course/detail/EnrollmentCard";
import { CourseStats } from "../components/course/detail/CourseStats";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Review } from "../types/api";

export const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: courseData, isLoading } = useCourse(id!);
  const { data: modulesData } = useModulesByCourse(id!);
  const [isEnrolling, setIsEnrolling] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData?.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Curso nÃ£o encontrado
        </h2>
        <p className="text-gray-600">
          O curso que vocÃª estÃ¡ procurando nÃ£o existe.
        </p>
      </div>
    );
  }

  const course = courseData.data;
  const modules = modulesData?.data || [];
  const reviews: Review[] = [];
  const isEnrolled = false;

  const totalLessons = modules.reduce(
    (acc, module) => acc + (module.lessons?.length || 0),
    0
  );
  const totalDuration = modules.reduce(
    (acc, module) =>
      acc +
      (module.lessons?.reduce(
        (lessonAcc, lesson) => lessonAcc + (lesson.duration ?? 0),
        0
      ) || 0),
    0
  );

  const handleEnroll = async () => {
    if (!user) {
      return;
    }

    setIsEnrolling(true);
    try {
      console.log("Enrolling in course:", course.id);
    } catch (error) {
      console.error("Error enrolling:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/courses"
          className="inline-flex items-center text-gray-600 hover:text-[#FF204E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para cursos
        </Link>
      </div>

      <div className="space-y-8">
        <CourseHeader
          course={course}
          totalLessons={totalLessons}
          totalDuration={totalDuration}
        />
        \
        <CourseStats course={course} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CoursePreview imageUrl={course.imageUrl} title={course.title} />
            <CourseTabs course={course} modules={modules} reviews={reviews} />
          </div>

          <div className="lg:col-span-1">
            <EnrollmentCard
              course={course}
              isEnrolled={isEnrolled}
              onEnroll={handleEnroll}
              isEnrolling={isEnrolling}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
