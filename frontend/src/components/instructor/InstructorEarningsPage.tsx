import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface StripeAccountStatus {
  accountId: string;
  accountStatus: "pending" | "enabled" | "restricted";
  onboardingCompleted: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
}

interface EarningsData {
  totalEarnings: number;
  currentBalance: number;
  pendingBalance: number;
  totalPayouts: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    courseTitle: string;
    studentName: string;
    date: string;
    status: "completed" | "pending";
  }>;
}

export const InstructorEarningsPage: React.FC = () => {
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(
    null
  );
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStripeStatus();
    fetchEarnings();
  }, []);

  const fetchStripeStatus = async () => {
    try {
      const response = await fetch(
        "/api/payments/stripe-connect/account-status",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStripeStatus(data.data);
      }
    } catch (error) {
      console.error("Erro ao buscar status da conta Stripe:", error);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await fetch("/api/payments/instructor/earnings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setEarnings(data.data);
      }
    } catch (error) {
      console.error("Erro ao buscar ganhos:", error);
    } finally {
      setLoading(false);
    }
  };

  const createStripeAccount = async () => {
    try {
      const response = await fetch(
        "/api/payments/stripe-connect/create-account",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Redirecionar para onboarding do Stripe
        window.open(data.data.onboardingUrl, "_blank");
      }
    } catch (error) {
      console.error("Erro ao criar conta Stripe:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enabled":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "restricted":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Restrito
          </Badge>
        );
      default:
        return <Badge variant="outline">Não configurado</Badge>;
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meus Ganhos</h1>
          <p className="text-gray-600">
            Gerencie seus ganhos e configurações de pagamento
          </p>
        </div>
      </div>

      {/* Status da Conta Stripe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Status da Conta de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stripeStatus ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Conta de Pagamentos Não Configurada
              </h3>
              <p className="text-gray-600 mb-4">
                Para receber pagamentos das suas vendas, você precisa configurar
                uma conta no Stripe.
              </p>
              <Button
                onClick={createStripeAccount}
                className="bg-[#635BFF] hover:bg-[#5A52E8]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Configurar Conta de Pagamentos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status da Conta:</span>
                {getStatusBadge(stripeStatus.accountStatus)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Onboarding Completo:</span>
                  <span>{stripeStatus.onboardingCompleted ? "✅" : "❌"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Saques Habilitados:</span>
                  <span>{stripeStatus.payoutsEnabled ? "✅" : "❌"}</span>
                </div>
              </div>

              {!stripeStatus.onboardingCompleted && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      Ação Necessária
                    </span>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    Complete o processo de verificação para começar a receber
                    pagamentos.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-300"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Completar Verificação
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      {earnings && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total de Ganhos
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPrice(earnings.totalEarnings)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Saldo Disponível
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPrice(earnings.currentBalance)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pendente
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPrice(earnings.pendingBalance)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Sacado
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPrice(earnings.totalPayouts)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Como Funcionam os Saques */}
          <Card>
            <CardHeader>
              <CardTitle>Como Funciona o Saque dos Seus Ganhos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  💰 Recebimento Automático
                </h4>
                <p className="text-blue-800 text-sm">
                  Seus ganhos são transferidos automaticamente para sua conta
                  bancária pelo Stripe. Você recebe 90% do valor de cada venda,
                  com as taxas do Stripe já descontadas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium">🏦 Quando Recebo?</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Automaticamente a cada 7 dias</li>
                    <li>• Ou quando atingir R$ 200 de saldo</li>
                    <li>• Depende da configuração da sua conta</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">💳 Para Onde Vai?</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Direto para sua conta bancária</li>
                    <li>• Configurada no painel do Stripe</li>
                    <li>• Sem passar pela plataforma</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Gerencie suas configurações de pagamento diretamente no Stripe
                </span>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Abrir Painel Stripe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earnings.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">
                            {transaction.courseTitle}
                          </p>
                          <p className="text-sm text-gray-600">
                            Comprado por {transaction.studentName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(transaction.amount)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {transaction.date}
                        </span>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {transaction.status === "completed"
                            ? "Concluído"
                            : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
