import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCourses, useCoursesByInstructor } from "../hooks/useCourses";
import { useEnrollmentsByUser } from "../hooks/useCategoriesAndEnrollments";
import { WelcomeSection } from "../components/dashboard/WelcomeSection";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { ContinueLearning } from "../components/dashboard/ContinueLearning";
import { RecommendedCourses } from "../components/dashboard/RecommendedCourses";
import { InstructorSection } from "../components/dashboard/InstructorSection";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { BookOpen, GraduationCap } from "lucide-react";

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("student");
  const { user } = useAuth();
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    limit: 4,
  });
  const { data: enrollmentsData } = useEnrollmentsByUser(user?.id || "");
  const { data: instructorCoursesData } = useCoursesByInstructor(
    user?.id || ""
  );

  const enrollments = enrollmentsData?.data || [];
  const courses = coursesData?.data || [];
  const instructorCourses = instructorCoursesData?.data || [];
  const isInstructor = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  return (
    <div className="space-y-8 animate-fade-in">
      <WelcomeSection user={user} />

      {isInstructor ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Área do Aluno
            </TabsTrigger>
            <TabsTrigger value="instructor" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Área do Instrutor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-8 mt-8">
            <StatsGrid enrollments={enrollments} />
            <ContinueLearning enrollments={enrollments} />
            <RecommendedCourses courses={courses} isLoading={coursesLoading} />
          </TabsContent>

          <TabsContent value="instructor" className="space-y-8 mt-8">
            <InstructorSection courses={instructorCourses} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-8">
          <StatsGrid enrollments={enrollments} />
          <ContinueLearning enrollments={enrollments} />
          <RecommendedCourses courses={courses} isLoading={coursesLoading} />
        </div>
      )}
    </div>
  );
};
