import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InstructorCouponManagement } from "@/components/instructor/InstructorCouponManagement";
import { InstructorPaymentAnalytics } from "@/components/instructor/InstructorPaymentAnalytics";
import { InstructorSection } from "@/components/dashboard/InstructorSection";
import { useCoursesByInstructor } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    data: coursesResponse,
    isLoading,
    error,
  } = useCoursesByInstructor(user?.id || "");

  const courses = coursesResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">
            Error loading dashboard: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your courses, students, and marketing tools
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coupons">Coupons & Discounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <InstructorSection courses={courses} />
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coupon Management</CardTitle>
              <CardDescription>
                Create and manage discount coupons for your courses. You can
                create coupons that apply to specific courses or all of your
                courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstructorCouponManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View detailed analytics about your courses, student engagement,
                and revenue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-600">
                  Course analytics features coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
                <CardDescription>
                  View your revenue analytics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InstructorPaymentAnalytics />
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Payouts & Withdrawals
                </CardTitle>
                <CardDescription>
                  Manage your earnings and withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Access your payout dashboard to view your balance, request
                  withdrawals, and track payout history.
                </p>
                <Button
                  onClick={() => navigate("/instructor/payout")}
                  className="w-full"
                  variant="outline"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Open Payout Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

