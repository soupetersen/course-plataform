import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { VerifyResetCodePage } from "../pages/auth/VerifyResetCodePage";
import { NewPasswordPage } from "../pages/auth/NewPasswordPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LandingPage } from "../pages/LandingPage";
import { LearnPage } from "../pages/LearnPage";
import { MyLearningPage } from "../pages/MyLearningPage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { CoursesPage } from "@/pages/CoursesPage";
import { CourseDetailPage } from "@/pages/CourseDetailPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { CreateCoursePage } from "@/pages/CreateCoursePage";
import { EditCoursePage } from "@/pages/EditCoursePage";
import { CourseViewPage } from "@/pages/CourseViewPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminPayments } from "@/pages/AdminPayments";
import { UserDashboard } from "@/pages/UserDashboard";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { InstructorDashboard } from "@/pages/InstructorDashboard";
import InstructorPayoutDashboard from "@/pages/InstructorPayoutDashboard";
import { SettingsPage } from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses",
        element: <CoursesPage />,
      },
      {
        path: "explore",
        element: <CoursesPage />,
      },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearningPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:id",
        element: <CourseDetailPage />,
      },
      {
        path: "learn/:courseId",
        element: (
          <ProtectedRoute>
            <LearnPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/create",
        element: (
          <ProtectedRoute>
            <CreateCoursePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/:id/edit",
        element: (
          <ProtectedRoute>
            <EditCoursePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/:id",
        element: <CourseViewPage />,
      },
      {
        path: "checkout/:courseId",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/payments",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AdminPayments />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-dashboard",
        element: (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "instructor-dashboard",
        element: (
          <ProtectedRoute requiredRole="INSTRUCTOR">
            <InstructorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "instructor/payout",
        element: (
          <ProtectedRoute requiredRole="INSTRUCTOR">
            <InstructorPayoutDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password/verify",
        element: <VerifyResetCodePage />,
      },
      {
        path: "reset-password/new",
        element: <NewPasswordPage />,
      },
    ],
  },
]);
