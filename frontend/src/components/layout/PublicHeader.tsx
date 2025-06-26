import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, BookOpen, Menu } from "lucide-react";
import { useState } from "react";

export function PublicHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {" "}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FF204E] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold text-[#00224D]">
              EduMy
            </span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-8">
            {user && (
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-quaternary-500 transition-colors whitespace-nowrap"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/courses"
              className="text-gray-700 hover:text-[#FF204E] transition-colors"
            >
              Cursos
            </Link>
            <Link
              to="/#features"
              className="text-gray-700 hover:text-[#FF204E] transition-colors"
            >
              Recursos
            </Link>
            <Link
              to="/#benefits"
              className="text-gray-700 hover:text-[#FF204E] transition-colors"
            >
              Benefícios
            </Link>
          </nav>
          <div className="lg:hidden">
            <DropdownMenu
              open={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    navigate("/courses");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Cursos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigate("/#features");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Recursos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigate("/#benefits");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Benefícios
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>{" "}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1 md:space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline truncate max-w-20 md:max-w-none">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-1 md:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-gray-700 hover:text-[#FF204E] text-sm"
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="bg-[#FF204E] hover:bg-[#A0153E] text-white text-sm"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
