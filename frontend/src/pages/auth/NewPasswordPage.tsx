import { useState, useEffect } from "react";
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
import { useResetPassword } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from "lucide-react";

export function NewPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleError, handleSuccess } = useErrorHandler();
  const resetPasswordMutation = useResetPassword();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");

    if (emailParam && codeParam) {
      setEmail(decodeURIComponent(emailParam));
      setCode(codeParam);
    } else {
      navigate("/forgot-password");
    }
  }, [searchParams, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      handleError("Por favor, preencha todos os campos", {
        title: "Campos obrigatórios",
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      handleError("A senha deve ter pelo menos 8 caracteres", {
        title: "Senha muito curta",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      handleError("As senhas não coincidem", {
        title: "Senhas diferentes",
      });
      return;
    }

    resetPasswordMutation.mutate(
      {
        email,
        code,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          handleSuccess("Senha alterada com sucesso!");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        },
        onError: (error: any) => {
          handleError(error, {
            title: "Erro ao alterar senha",
          });
        },
      }
    );
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
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-quaternary-500">
            Nova senha
          </CardTitle>
          <CardDescription>
            Digite sua nova senha para finalizar a recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="pl-10 pr-10 animate-slide-in-left"
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={resetPasswordMutation.isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">Mínimo de 8 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 animate-slide-in-right"
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={resetPasswordMutation.isPending}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword && (
                <div className="flex items-center text-xs">
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500">Senhas coincidem</span>
                    </>
                  ) : (
                    <span className="text-red-500">Senhas não coincidem</span>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white fade-in-up"
              disabled={
                resetPasswordMutation.isPending ||
                !formData.newPassword ||
                !formData.confirmPassword ||
                formData.newPassword !== formData.confirmPassword
              }
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando senha...
                </>
              ) : (
                "Alterar senha"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

