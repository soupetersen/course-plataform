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
import { User, LogOut, Settings, BookOpen } from "lucide-react";

export function PublicHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FF204E] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#00224D]">CourseHub</span>
          </Link>

          {}
          <nav className="hidden md:flex items-center space-x-8">
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
              to="/#testimonials"
              className="text-gray-700 hover:text-[#FF204E] transition-colors"
            >
              Depoimentos
            </Link>
          </nav>

          {}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-gray-700 hover:text-[#FF204E]"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-[#FF204E] hover:bg-[#A0153E] text-white"
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
