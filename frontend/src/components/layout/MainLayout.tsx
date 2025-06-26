import type { ReactNode } from "react";
import { useState } from "react";
import { Header } from "./Header";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-quaternary via-tertiary to-secondary">
        {children}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {" "}
      <Header onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
      <div className="flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />{" "}
        <main className="flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 lg:ml-64">
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

