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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-full sm:max-w-2xl">
            <TabsTrigger
              value="student"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Aprendizado</span>
              <span className="xs:hidden">Learn</span>
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Cupons</span>
              <span className="xs:hidden">Cups</span>
            </TabsTrigger>
            <TabsTrigger
              value="instructor"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Instrutor</span>
              <span className="xs:hidden">Inst</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Pagamentos</span>
              <span className="xs:hidden">Pay</span>
            </TabsTrigger>
          </TabsList>{" "}
          <TabsContent
            value="student"
            className="space-y-6 sm:space-y-8 mt-6 sm:mt-8"
          >
            <StatsGrid enrollments={enrollments} />
            <ContinueLearning enrollments={enrollments} />
            <RecommendedCourses courses={courses} isLoading={coursesLoading} />
          </TabsContent>{" "}
          <TabsContent
            value="coupons"
            className="space-y-6 sm:space-y-8 mt-6 sm:mt-8"
          >
            {user?.role === "ADMIN" ? (
              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Gerenciamento de Cupons - Admin
                </h2>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Gerencie todos os cupons do sistema
                </p>
                <CouponManagement />
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  📧 Cupons por Email
                </h2>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Os cupons de desconto serão enviados diretamente para seu
                  email quando disponíveis.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-blue-800 text-xs sm:text-sm">
                    💡 <strong>Dica:</strong> Mantenha-se atento ao seu email
                    para não perder nenhuma promoção especial!
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent
            value="instructor"
            className="space-y-6 sm:space-y-8 mt-6 sm:mt-8"
          >
            <InstructorSection courses={instructorCourses} />
            <div className="bg-white rounded-lg border p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Gerenciar Cupons
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Crie e gerencie cupons de desconto para seus cursos
              </p>
              <InstructorCouponManagement />
            </div>
          </TabsContent>
          <TabsContent
            value="payments"
            className="space-y-6 sm:space-y-8 mt-6 sm:mt-8"
          >
            <UserPaymentHistory />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <StatsGrid enrollments={enrollments} />
          <ContinueLearning enrollments={enrollments} />
          <RecommendedCourses courses={courses} isLoading={coursesLoading} />
        </div>
      )}
    </div>
  );
};
