import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Shield,
  X,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar = ({
  isMobileOpen = false,
  setIsMobileOpen,
}: SidebarProps = {}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Fechar sidebar mobile ao navegar
  useEffect(() => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, setIsMobileOpen]);

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Cursos",
      icon: GraduationCap,
      href: "/courses",
    },
    {
      title: "Meu Aprendizado",
      icon: BookOpen,
      href: "/my-learning",
    },
    ...(user?.role === "INSTRUCTOR" || user?.role === "ADMIN"
      ? [
          {
            title: "Pagamentos",
            icon: CreditCard,
            href: "/instructor/payout",
          },
        ]
      : []),
    {
      title: "Perfil",
      icon: User,
      href: "/profile",
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            title: "Admin",
            icon: Shield,
            href: "/admin",
          },
        ]
      : []),
    {
      title: "Configurações",
      icon: Settings,
      href: "/settings",
    },
  ];

  const isActive = (href: string) => location.pathname === href;
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:left-0 lg:top-16 lg:block h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <div className="absolute -right-3 top-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 rounded-full p-0 bg-white shadow-md hover:shadow-lg"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200 animate-slide-in-left",
                    isCollapsed ? "px-2" : "px-4",
                    isActive(item.href) && "bg-primary text-white shadow-md"
                  )}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <span className="animate-fade-in">{item.title}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>{" "}
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}
      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 z-50 w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {" "}
        {/* Close Button */}
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen?.(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {/* Navigation */}
        <nav className="p-4 space-y-2 pt-16">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    isActive(item.href) && "bg-primary text-white shadow-md"
                  )}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span>{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
