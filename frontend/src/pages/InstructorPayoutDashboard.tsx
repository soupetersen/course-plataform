import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { toast } from "sonner";

interface InstructorBalance {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  nextPayoutDate?: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  method: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  requestedAt: string;
  processedAt?: string;
  estimatedProcessingTime?: string;
}

interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  createdAt: string;
  course?: { title: string };
}

export default function InstructorPayoutDashboard() {
  const [balance, setBalance] = useState<InstructorBalance | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulário de saque
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"PIX" | "BANK_TRANSFER">(
    "PIX"
  );
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Dados bancários
  const [showPayoutDataForm, setShowPayoutDataForm] = useState(false);
  const [payoutData, setPayoutData] = useState({
    pixKey: "",
    fullName: "",
    documentType: "CPF" as "CPF" | "CNPJ",
    documentNumber: "",
    payoutPreference: "PIX" as "PIX" | "BANK_TRANSFER",
    bankData: {
      bank: "",
      agency: "",
      account: "",
      accountType: "CORRENTE" as "CORRENTE" | "POUPANCA",
      accountHolder: "",
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Simular carregamento (substituir por chamadas reais à API)
      const [balanceRes, historyRes, transactionsRes] = await Promise.all([
        // api.get('/instructor/payout/balance'),
        // api.get('/instructor/payout/history'),
        // api.get('/instructor/payout/transactions?limit=10')
        Promise.resolve({
          data: {
            availableBalance: 450.0,
            pendingBalance: 120.0,
            totalEarnings: 2340.0,
            totalWithdrawn: 1770.0,
            nextPayoutDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        }),
        Promise.resolve({
          data: [
            {
              id: "payout_001",
              amount: 250.0,
              method: "PIX",
              status: "COMPLETED",
              requestedAt: "2025-06-20T10:00:00Z",
              processedAt: "2025-06-21T14:30:00Z",
            },
            {
              id: "payout_002",
              amount: 180.0,
              method: "BANK_TRANSFER",
              status: "PROCESSING",
              requestedAt: "2025-06-24T16:20:00Z",
              estimatedProcessingTime: "2-5 dias úteis",
            },
          ],
        }),
        Promise.resolve({
          data: {
            transactions: [
              {
                id: "tx_001",
                type: "CREDIT",
                amount: 90.0,
                description: "Venda do curso: JavaScript Avançado",
                createdAt: "2025-06-24T10:30:00Z",
                course: { title: "JavaScript Avançado" },
              },
              {
                id: "tx_002",
                type: "DEBIT",
                amount: -250.0,
                description: "Saque processado via PIX",
                createdAt: "2025-06-21T14:30:00Z",
              },
            ],
          },
        }),
      ]);

      setBalance(balanceRes.data);
      setPayoutHistory(historyRes.data);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) < 50) {
      toast.error("Valor mínimo de saque é R$ 50,00");
      return;
    }

    if (!balance || parseFloat(payoutAmount) > balance.availableBalance) {
      toast.error("Saldo insuficiente");
      return;
    }

    try {
      setIsRequestingPayout(true);

      // TODO: Chamada real à API
      // await api.post('/instructor/payout/request', {
      //   amount: parseFloat(payoutAmount),
      //   method: payoutMethod
      // });

      toast.success("Solicitação de saque enviada com sucesso!");
      setPayoutAmount("");
      loadData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao solicitar saque:", error);
      toast.error("Erro ao solicitar saque");
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "secondary" as const, icon: Clock, text: "Pendente" },
      PROCESSING: {
        variant: "default" as const,
        icon: Loader,
        text: "Processando",
      },
      COMPLETED: {
        variant: "default" as const,
        icon: CheckCircle,
        text: "Concluído",
      },
      REJECTED: {
        variant: "destructive" as const,
        icon: XCircle,
        text: "Rejeitado",
      },
    };

    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <Button onClick={() => setShowPayoutDataForm(true)} variant="outline">
          Configurar Dados de Pagamento
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(balance?.availableBalance || 0)}
            </div>
            <p className="text-xs text-gray-500">Pronto para saque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(balance?.pendingBalance || 0)}
            </div>
            <p className="text-xs text-gray-500">
              Liberação em{" "}
              {balance?.nextPayoutDate
                ? formatDate(balance.nextPayoutDate)
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance?.totalEarnings || 0)}
            </div>
            <p className="text-xs text-gray-500">Ganhos totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sacado</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance?.totalWithdrawn || 0)}
            </div>
            <p className="text-xs text-gray-500">Saques realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Saque */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitar Saque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              Valor mínimo: R$ 50,00 • Processamento: 2-5 dias úteis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Valor do Saque</label>
              <Input
                type="number"
                placeholder="0,00"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min="50"
                max={balance?.availableBalance || 0}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Método</label>
              <Select
                value={payoutMethod}
                onValueChange={(value: "PIX" | "BANK_TRANSFER") =>
                  setPayoutMethod(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX (Instantâneo)</SelectItem>
                  <SelectItem value="BANK_TRANSFER">
                    Transferência Bancária
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleRequestPayout}
                disabled={isRequestingPayout || !payoutAmount}
                className="w-full"
              >
                {isRequestingPayout ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Processando...
                  </>
                ) : (
                  "Solicitar Saque"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Histórico */}
      <Tabs defaultValue="payouts" className="w-full">
        <TabsList>
          <TabsTrigger value="payouts">Histórico de Saques</TabsTrigger>
          <TabsTrigger value="transactions">Extrato</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Saques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutHistory.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(payout.amount)}
                        </span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {payout.method} • Solicitado em{" "}
                        {formatDate(payout.requestedAt)}
                      </p>
                      {payout.estimatedProcessingTime && (
                        <p className="text-xs text-blue-600">
                          {payout.estimatedProcessingTime}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Extrato de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            transaction.type === "CREDIT"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "CREDIT" ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <Badge
                          variant={
                            transaction.type === "CREDIT"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {transaction.type === "CREDIT" ? "Crédito" : "Débito"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
