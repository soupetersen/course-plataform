import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCourses, useCoursesByInstructor } from "../hooks/useCourses";
import { useEnrollmentsByUser } from "../hooks/useCategoriesAndEnrollments";
import { WelcomeSection } from "../components/dashboard/WelcomeSection";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { ContinueLearning } from "../components/dashboard/ContinueLearning";
import { RecommendedCourses } from "../components/dashboard/RecommendedCourses";
import { InstructorSection } from "../components/dashboard/InstructorSection";
import { UserPaymentHistory } from "../components/dashboard/UserPaymentHistory";
import { StudentCoupons } from "../components/dashboard/StudentCoupons";
import { InstructorCouponManagement } from "../components/instructor/InstructorCouponManagement";
import { CouponManagement } from "../components/admin/CouponManagement";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { BookOpen, GraduationCap, CreditCard, Gift } from "lucide-react";

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("student");
  const { user } = useAuth();
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    limit: 4,
    status: "PUBLISHED",
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
      <WelcomeSection user={user} />{" "}
      {isInstructor ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {" "}
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Aprendizado
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Cupons
            </TabsTrigger>
            <TabsTrigger value="instructor" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Instrutor
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pagamentos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="student" className="space-y-8 mt-8">
            <StatsGrid enrollments={enrollments} />
            <ContinueLearning enrollments={enrollments} />
            <RecommendedCourses courses={courses} isLoading={coursesLoading} />
          </TabsContent>{" "}
          <TabsContent value="coupons" className="space-y-8 mt-8">
            {user?.role === "ADMIN" ? (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Gerenciamento de Cupons - Admin
                </h2>
                <p className="text-gray-600 mb-6">
                  Gerencie todos os cupons do sistema
                </p>
                <CouponManagement />
              </div>
            ) : (
              <StudentCoupons />
            )}
          </TabsContent>
          <TabsContent value="instructor" className="space-y-8 mt-8">
            <InstructorSection courses={instructorCourses} />
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Gerenciar Cupons
              </h2>
              <p className="text-gray-600 mb-6">
                Crie e gerencie cupons de desconto para seus cursos
              </p>
              <InstructorCouponManagement />
            </div>
          </TabsContent>{" "}
          <TabsContent value="payments" className="space-y-8 mt-8">
            <UserPaymentHistory />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-8">
          <StatsGrid enrollments={enrollments} />
          <ContinueLearning enrollments={enrollments} />
          <StudentCoupons />
          <RecommendedCourses courses={courses} isLoading={coursesLoading} />
        </div>
      )}
    </div>
  );
};
