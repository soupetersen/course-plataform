import { Outlet, useLocation } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { Header } from "./components/layout/Header";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./hooks/useAuth";

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const alwaysPublicRoutes = ["/", "/login", "/register"];

  const conditionalPublicRoutes = ["/courses"];

  const noSidebarRoutes = ["/learn"];

  const isAlwaysPublic = alwaysPublicRoutes.includes(location.pathname);
  const isConditionalPublic = conditionalPublicRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/")
  );
  const isNoSidebarRoute = noSidebarRoutes.some((route) =>
    location.pathname.startsWith(route + "/")
  );

  const shouldUsePublicLayout =
    isAlwaysPublic || (isConditionalPublic && !isAuthenticated);
  if (isNoSidebarRoute && isAuthenticated) {
    return (
      <>
        <div className="h-screen bg-gray-50 flex flex-col">
          <Header />
          <div className="flex-1 overflow-hidden p-4">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  if (shouldUsePublicLayout) {
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
