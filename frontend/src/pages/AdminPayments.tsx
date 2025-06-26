import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  RefreshCw,
} from "lucide-react";
import { usePaymentApi } from "@/hooks/usePaymentApi";

interface PaymentListItem {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  courseId: string;
  courseTitle?: string;
  amount: number;
  currency: string;
  status: string;
  paymentType: string;
  paymentMethod?: string;
  externalPaymentId?: string;
  gatewayProvider?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  totalAmount: number;
}

export function AdminPayments() {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const {
    getAllPayments,
    approvePayment: adminApprovePayment,
    rejectPayment: adminRejectPayment,
  } = usePaymentApi();
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Iniciando busca de pagamentos...");

      const response = await getAllPayments();
      console.log("📊 Resposta completa da API:", response);
      console.log("✅ response.success:", response?.success);
      console.log("📦 response.data:", response?.data);
      console.log("💳 response.data.payments:", response?.data?.payments);

      if (
        response &&
        response.success &&
        response.data &&
        response.data.payments
      ) {
        console.log("✅ Estrutura de dados válida encontrada");

        const paymentsArray = Array.isArray(response.data.payments)
          ? response.data.payments.map((item: PaymentListItem) => ({
              ...item,
              userName: item.userName || "N/A",
              userEmail: item.userEmail || "N/A",
              courseTitle: item.courseTitle || "N/A",
            }))
          : [];

        console.log("🔄 Pagamentos processados:", paymentsArray);
        console.log("📊 Quantidade de pagamentos:", paymentsArray.length);
        setPayments(paymentsArray);
        console.log("💾 Pagamentos salvos no state:", paymentsArray);

        const stats: PaymentStats = {
          total: paymentsArray.length,
          pending: paymentsArray.filter(
            (p: PaymentListItem) => p.status === "PENDING"
          ).length,
          completed: paymentsArray.filter(
            (p: PaymentListItem) => p.status === "COMPLETED"
          ).length,
          failed: paymentsArray.filter((p: PaymentListItem) =>
            ["FAILED", "CANCELLED", "REFUNDED"].includes(p.status)
          ).length,
          totalAmount: paymentsArray
            .filter((p: PaymentListItem) => p.status === "COMPLETED")
            .reduce((sum: number, p: PaymentListItem) => sum + p.amount, 0),
        };

        console.log("📈 Estatísticas calculadas:", stats);
        setStats(stats);
      } else {
        console.warn("⚠️ Estrutura de dados inválida ou vazia");
        console.log("response:", response);
        setPayments([]);
        setStats({
          total: 0,
          pending: 0,
          completed: 0,
          failed: 0,
          totalAmount: 0,
        });
      }
    } catch (error) {
      console.error("❌ Erro ao buscar pagamentos:", error);

      setPayments([]);
      setStats({
        total: 0,
        pending: 0,
        completed: 0,
        failed: 0,
        totalAmount: 0,
      });

      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getAllPayments, toast]);

  const approvePayment = async (paymentId: string) => {
    try {
      setActionLoading(paymentId);

      const response = await adminApprovePayment(
        paymentId,
        "Aprovado pelo administrador"
      );

      if (response?.success) {
        toast({
          title: "Sucesso",
          description: "Pagamento aprovado com sucesso!",
        });

        await fetchPayments();
      } else {
        toast({
          title: "Erro",
          description:
            response?.message || "Não foi possível aprovar o pagamento",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao aprovar pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o pagamento",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      setActionLoading(paymentId);

      const response = await adminRejectPayment(
        paymentId,
        "Rejeitado pelo administrador"
      );

      if (response?.success) {
        toast({
          title: "Sucesso",
          description: "Pagamento rejeitado com sucesso!",
        });

        await fetchPayments();
      } else {
        toast({
          title: "Erro",
          description:
            response?.message || "Não foi possível rejeitar o pagamento",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao rejeitar pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o pagamento",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      PENDING: { label: "Pendente", variant: "default" as const, icon: Clock },
      COMPLETED: {
        label: "Aprovado",
        variant: "default" as const,
        icon: CheckCircle,
      },
      FAILED: {
        label: "Falhou",
        variant: "destructive" as const,
        icon: XCircle,
      },
      CANCELLED: {
        label: "Cancelado",
        variant: "secondary" as const,
        icon: XCircle,
      },
      REFUNDED: {
        label: "Reembolsado",
        variant: "outline" as const,
        icon: XCircle,
      },
    };

    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Carregando pagamentos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel de Pagamentos</h1>
        <Button onClick={fetchPayments} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pagamentos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Arrecadado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(payments) &&
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {payment.userName || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {payment.userEmail || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-32 truncate"
                          title={payment.courseTitle}
                        >
                          {payment.courseTitle || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.paymentMethod || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {payment.gatewayProvider || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        {payment.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => approvePayment(payment.id)}
                              disabled={actionLoading === payment.id}
                            >
                              {actionLoading === payment.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectPayment(payment.id)}
                              disabled={actionLoading === payment.id}
                            >
                              <XCircle className="w-3 h-3" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum pagamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

