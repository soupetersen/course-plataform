import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  CreditCard,
  Download,
  RefreshCw,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentApi } from "../../hooks/usePaymentApi";
import { Payment } from "../../types/payment";

interface PaymentHistoryItem {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED";
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  createdAt: string;
}

export const UserPaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const { getUserPayments } = usePaymentApi();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserPayments();
      console.log("Payment history result:", result);

      if (result) {
        const paymentsData = result.payments || [];
        const mappedPayments: PaymentHistoryItem[] = paymentsData.map(
          (payment: Payment) => ({
            id: payment.id,
            courseId: payment.courseId,
            courseTitle: payment.course?.title || `Course ${payment.courseId}`,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentType: payment.paymentType,
            createdAt: payment.createdAt,
          })
        );
        setPayments(mappedPayments);
      } else {
        console.warn("API returned null or empty result:", result);
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [getUserPayments]);

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user, fetchPaymentHistory]);

  const formatCurrency = (amount: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: {
        variant: "default" as const,
        label: "Concluído",
        color: "text-green-600",
      },
      PENDING: {
        variant: "secondary" as const,
        label: "Pendente",
        color: "text-yellow-600",
      },
      FAILED: {
        variant: "destructive" as const,
        label: "Falhou",
        color: "text-red-600",
      },
      REFUNDED: {
        variant: "outline" as const,
        label: "Reembolsado",
        color: "text-blue-600",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const downloadReceipt = (paymentId: string) => {
    console.log("Downloading receipt for payment:", paymentId);
  };

  const exportHistory = () => {
    console.log("Exporting payment history...");
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">
            Faça login para ver seu histórico de pagamentos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              Histórico de Pagamentos
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Veja todos os seus pagamentos e compras de cursos
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              className="text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Exportar</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPaymentHistory}
              className="text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Atualizar</span>
              <span className="sm:hidden">Update</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 sm:py-8">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-red-600 mb-3 sm:mb-4 text-sm sm:text-base">
              {error}
            </p>
            <Button onClick={fetchPaymentHistory} size="sm">
              Tentar Novamente
            </Button>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Nenhum pagamento encontrado
            </h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Você ainda não fez nenhuma compra. Explore nossos cursos!
            </p>
            <Link to="/courses">
              <Button size="sm">Ver Cursos</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.courseTitle}</p>
                          <p className="text-sm text-gray-600">
                            ID: {payment.id.slice(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.paymentType === "ONE_TIME"
                            ? "Pagamento Único"
                            : "Assinatura"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        {payment.status === "COMPLETED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadReceipt(payment.id)}
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            Recibo
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {payments.map((payment) => (
                <Card key={payment.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {payment.courseTitle}
                          </h3>
                          <p className="text-xs text-gray-500">
                            ID: {payment.id.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {payment.paymentType === "ONE_TIME"
                              ? "Único"
                              : "Assinatura"}
                          </Badge>
                          {payment.status === "COMPLETED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadReceipt(payment.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Receipt className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
