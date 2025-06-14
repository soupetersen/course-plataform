import { Outlet, useLocation } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { PublicLayout } from "./components/layout/PublicLayout";

function App() {
  const location = useLocation();

  const publicRoutes = ["/", "/login", "/register", "/courses"];
  const isPublicRoute =
    publicRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/courses/");

  if (isPublicRoute) {
    return (
      <PublicLayout>
        <Outlet />
      </PublicLayout>
    );
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default App;
