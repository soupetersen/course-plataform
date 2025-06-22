import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps = {}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  console.log("Header rendered with user:", user);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {" "}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button (apenas quando autenticado) */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={onMobileMenuClick}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <Link to="/" className="flex items-center animate-fade-in">
              <div className="text-xl md:text-2xl font-bold text-quaternary-500">
                Guitar Academy
              </div>
            </Link>

            {user && (
              <>
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex space-x-6">
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-quaternary-500 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/explore"
                    className="text-gray-600 hover:text-quaternary-500 transition-colors"
                  >
                    Explorar
                  </Link>
                  <Link
                    to="/my-learning"
                    className="text-gray-600 hover:text-quaternary-500 transition-colors"
                  >
                    Meu Aprendizado
                  </Link>
                </nav>
              </>
            )}
          </div>
          {/* User Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 md:h-10 md:w-10 rounded-full"
                  >
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage
                        src={user.avatar || ""}
                        alt={user.name || "User"}
                      />
                      <AvatarFallback className="bg-primary-100 text-primary-700 text-xs md:text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email || ""}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-1 md:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-gray-600 hover:text-quaternary-500 text-sm"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="bg-primary-500 hover:bg-primary-600 text-white text-sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
