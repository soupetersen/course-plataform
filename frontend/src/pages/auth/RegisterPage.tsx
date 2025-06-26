import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT" as "STUDENT" | "INSTRUCTOR",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const register = useRegister();

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push("Nome é obrigatório");
    }

    if (!formData.email.trim()) {
      newErrors.push("Email é obrigatório");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Email inválido");
    }

    if (!formData.password) {
      newErrors.push("Senha é obrigatória");
    } else if (formData.password.length < 6) {
      newErrors.push("Senha deve ter pelo menos 6 caracteres");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Senhas não coincidem");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    register.mutate(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);

          setTimeout(() => {
            navigate("/login");
          }, 4000);
        },
        onError: (error: Error) => {
          setErrors([error.message || "Erro ao criar conta"]);
        },
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-quaternary via-tertiary to-secondary">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl fade-in-up">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-quaternary">
              Criar Conta
            </CardTitle>
            <CardDescription>
              Junte-se à nossa plataforma de cursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSuccess && (
                <Alert className="fade-in bg-green-50 border-green-200 text-green-800">
                  {" "}
                  <AlertDescription className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-1">
                        ? Conta criada com sucesso!
                      </div>
                      <div className="text-sm">
                        Redirecionando para a página de login...
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {errors.length > 0 && !isSuccess && (
                <Alert variant="destructive" className="fade-in">
                  <AlertDescription>
                    {" "}
                    <ul className="space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  className="transition-all duration-200 focus:scale-105"
                  disabled={register.isPending || isSuccess}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="transition-all duration-200 focus:scale-105"
                  disabled={register.isPending || isSuccess}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de conta</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={
                      formData.role === "STUDENT" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFormData({ ...formData, role: "STUDENT" })
                    }
                    className="flex-1"
                    disabled={register.isPending || isSuccess}
                  >
                    Estudante
                  </Button>
                  <Button
                    type="button"
                    variant={
                      formData.role === "INSTRUCTOR" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFormData({ ...formData, role: "INSTRUCTOR" })
                    }
                    className="flex-1"
                    disabled={register.isPending || isSuccess}
                  >
                    Instrutor
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  {" "}
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10 transition-all duration-200 focus:scale-105"
                    disabled={register.isPending || isSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  {" "}
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pr-10 transition-all duration-200 focus:scale-105"
                    disabled={register.isPending || isSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                disabled={register.isPending || isSuccess}
              >
                {isSuccess ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecionando...
                  </>
                ) : register.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Entrar
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
