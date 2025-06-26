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
import { useValidateResetCode } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";

export function VerifyResetCodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleError, handleSuccess } = useErrorHandler();
  const validateCodeMutation = useValidateResetCode();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      navigate("/forgot-password");
    }
  }, [searchParams, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      handleError("Por favor, insira o código", {
        title: "Campo obrigatório",
      });
      return;
    }

    if (code.length !== 6) {
      handleError("O código deve ter 6 dígitos", {
        title: "Código inválido",
      });
      return;
    }

    validateCodeMutation.mutate(
      { email, code },
      {
        onSuccess: () => {
          handleSuccess("Código válido!");
          navigate(
            `/reset-password/new?email=${encodeURIComponent(
              email
            )}&code=${code}`
          );
        },
        onError: (error: any) => {
          handleError(error, {
            title: "Código inválido",
          });
        },
      }
    );
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-quaternary-500">
            Digite o código
          </CardTitle>
          <CardDescription>
            Enviamos um código de 6 dígitos para {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de verificação</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  required
                  maxLength={6}
                  className="pl-10 text-center text-2xl tracking-widest animate-slide-in-left"
                  disabled={validateCodeMutation.isPending}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Digite o código de 6 dígitos enviado para seu email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white fade-in-up"
              disabled={validateCodeMutation.isPending || code.length !== 6}
            >
              {validateCodeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar código"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não recebeu o código?{" "}
                <button
                  type="button"
                  className="text-primary-500 hover:text-primary-600 font-medium underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  Reenviar
                </button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

