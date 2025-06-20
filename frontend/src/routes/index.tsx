import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LandingPage } from "../pages/LandingPage";
import { LessonPage } from "../pages/LessonPage";
import { ExplorePage } from "../pages/ExplorePage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { CoursesPage } from "@/pages/CoursesPage";
import { CourseDetailPage } from "@/pages/CourseDetailPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { CreateCoursePage } from "@/pages/CreateCoursePage";
import { EditCoursePage } from "@/pages/EditCoursePage";
import { CourseViewPage } from "@/pages/CourseViewPage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { UserDashboard } from "@/pages/UserDashboard";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { InstructorDashboard } from "@/pages/InstructorDashboard";
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
        element: <ExplorePage />,
      },
      {
        path: "courses/:id",
        element: <CourseDetailPage />,
      },
      {
        path: "courses/:courseId/lessons/:lessonId",
        element: <LessonPage />,
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
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
