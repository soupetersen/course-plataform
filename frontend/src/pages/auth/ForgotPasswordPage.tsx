import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useForgotPassword } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const forgotPasswordMutation = useForgotPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      handleError("Por favor, insira seu email", {
        title: "Campo obrigatório",
      });
      return;
    }

    if (!email.includes("@")) {
      handleError("Por favor, insira um email válido", {
        title: "Email inválido",
      });
      return;
    }

    forgotPasswordMutation.mutate({ email }, {
      onSuccess: () => {
        handleSuccess("Código enviado para seu email!");
        navigate(`/reset-password/verify?email=${encodeURIComponent(email)}`);
      },
      onError: (error: any) => {
        handleError(error, {
          title: "Erro ao enviar código",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-quaternary-500">
            Esqueceu sua senha?
          </CardTitle>
          <CardDescription>
            Digite seu email para receber um código de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 animate-slide-in-left"
                  disabled={forgotPasswordMutation.isPending}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white fade-in-up"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                "Enviar código"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar para o login
              </Link>
            </div>
            
            <div className="text-center">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
