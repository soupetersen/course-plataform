import { Outlet, useLocation } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { Toaster } from "./components/ui/toaster";

function App() {
  const location = useLocation();

  const publicRoutes = ["/", "/login", "/register", "/courses"];
  const isPublicRoute =
    publicRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/courses/");
  if (isPublicRoute) {
    return (
      <>
        <PublicLayout>
          <Outlet />
        </PublicLayout>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainLayout>
        <Outlet />
      </MainLayout>
      <Toaster />
    </>
  );
}

export default App;
