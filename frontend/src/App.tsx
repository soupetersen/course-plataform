import { Outlet, useLocation } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./hooks/useAuth";

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Rotas que sempre usam layout público, mesmo se logado
  const alwaysPublicRoutes = ["/", "/login", "/register"];

  // Rotas que usam layout público apenas para usuários não logados
  const conditionalPublicRoutes = ["/courses"];

  const isAlwaysPublic = alwaysPublicRoutes.includes(location.pathname);
  const isConditionalPublic = conditionalPublicRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/")
  );

  const shouldUsePublicLayout =
    isAlwaysPublic || (isConditionalPublic && !isAuthenticated);

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
