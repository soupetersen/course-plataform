import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Meus Cursos",
      icon: BookOpen,
      href: "/courses",
    },
    {
      title: "Explorar",
      icon: GraduationCap,
      href: "/explore",
    },
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
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {}
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

      {}
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
    </aside>
  );
};
