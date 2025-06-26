import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginMutation } = useAuth();
  const { handleError, handleSuccess } = useErrorHandler();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      handleError("Por favor, preencha todos os campos", {
        title: "Campos obrigatórios",
      });
      return;
    }

    if (!formData.email.includes("@")) {
      handleError("Por favor, insira um email válido", {
        title: "Email inválido",
      });
      return;
    }

    loginMutation.mutate(formData, {
      onSuccess: () => {
        handleSuccess("Login realizado com sucesso!");
        setTimeout(() => navigate(redirectPath), 1000);
      },
      onError: (error) => {
        handleError(error, {
          title: "Falha no login",
        });
      },
    });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        {" "}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-quaternary-500">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription>
            Entre na sua conta para continuar aprendendo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {" "}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 animate-slide-in-left"
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 animate-slide-in-right"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={loginMutation.isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white fade-in-up"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
