import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Payment {
  id: string;
  courseId: string;
  courseName: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";
  createdAt: string;
  refundRequests?: RefundRequest[];
}

interface RefundRequest {
  id: string;
  paymentId: string;
  amount: number;
  reason?: string;
  status:
    | "PENDING"
    | "PROCESSED"
    | "APPROVED"
    | "REJECTED"
    | "FAILED"
    | "CANCELLED";
  notes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface RefundFormData {
  reason: string;
}

export function RefundManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundForm, setRefundForm] = useState<RefundFormData>({ reason: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchPayments = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/payments/my-payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        toast({
          title: "Erro",
          description: "Falha ao carregar pagamentos",
          variant: "destructive",
        });
      }
    } catch (fetchError) {
      console.error("Error fetching payments:", fetchError);
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchRefundRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/payments/refund-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRefundRequests(data.refundRequests || []);
      } else {
        console.error("Failed to fetch refund requests");
      }
    } catch (fetchError) {
      console.error("Error fetching refund requests:", fetchError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchRefundRequests();
  }, [fetchPayments, fetchRefundRequests]);

  const requestRefund = async () => {
    if (!selectedPayment) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/payments/request-refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          reason: refundForm.reason || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Solicitação enviada",
          description:
            "Sua solicitação de reembolso foi enviada e será analisada",
        });
        setIsRefundDialogOpen(false);
        setSelectedPayment(null);
        setRefundForm({ reason: "" });
        fetchRefundRequests();
        fetchPayments();
      } else {
        toast({
          title: "Erro",
          description: data.message || "Falha ao solicitar reembolso",
          variant: "destructive",
        });
      }
    } catch (requestError) {
      console.error("Error requesting refund:", requestError);
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRefundDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "outline", text: "Pendente", icon: Clock },
      COMPLETED: { variant: "default", text: "Pago", icon: CheckCircle },
      FAILED: { variant: "destructive", text: "Falhou", icon: XCircle },
      CANCELLED: { variant: "secondary", text: "Cancelado", icon: XCircle },
      REFUNDED: { variant: "secondary", text: "Reembolsado", icon: RefreshCw },
      PROCESSED: { variant: "default", text: "Processado", icon: CheckCircle },
      APPROVED: { variant: "default", text: "Aprovado", icon: CheckCircle },
      REJECTED: { variant: "destructive", text: "Rejeitado", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;

    const Icon = config.icon;
    return (
      <Badge
        variant={
          config.variant as "outline" | "default" | "destructive" | "secondary"
        }
        className="flex items-center gap-1"
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const canRequestRefund = (payment: Payment) => {
    if (payment.status !== "COMPLETED") return false;

    const paymentDate = new Date(payment.createdAt);
    const now = new Date();
    const daysDifference = Math.floor(
      (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const hasActiveRefund = refundRequests.some(
      (refund) =>
        refund.paymentId === payment.id &&
        ["PENDING", "APPROVED", "PROCESSED"].includes(refund.status)
    );

    return daysDifference <= 7 && !hasActiveRefund;
  };

  const getRefundRequestForPayment = (paymentId: string) => {
    return refundRequests.filter((refund) => refund.paymentId === paymentId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Meus Pagamentos
          </CardTitle>
          <CardDescription>
            Histórico de pagamentos e solicitações de reembolso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const refunds = getRefundRequestForPayment(payment.id);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.courseName}</div>
                        {refunds.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {refunds.length} solicitaç
                            {refunds.length === 1 ? "ão" : "ões"} de reembolso
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {canRequestRefund(payment) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRefundDialog(payment)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Solicitar Reembolso
                        </Button>
                      )}
                      {!canRequestRefund(payment) &&
                        payment.status === "COMPLETED" && (
                          <span className="text-xs text-muted-foreground">
                            {refundRequests.some(
                              (r) => r.paymentId === payment.id
                            )
                              ? "Reembolso solicitado"
                              : "Prazo expirado"}
                          </span>
                        )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {payments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pagamento encontrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Requests */}
      {refundRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Solicitações de Reembolso
            </CardTitle>
            <CardDescription>
              Acompanhe o status das suas solicitações de reembolso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundRequests.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell>{formatCurrency(refund.amount)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {refund.reason || "Não informado"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(refund.status)}</TableCell>
                    <TableCell>
                      {new Date(refund.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {refund.notes && (
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {refund.notes}
                        </div>
                      )}
                      {refund.processedAt && (
                        <div className="text-xs text-muted-foreground">
                          Processado em{" "}
                          {new Date(refund.processedAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Reembolso</DialogTitle>
            <DialogDescription>
              Solicite o reembolso do seu pagamento. A solicitação será
              analisada em até 5 dias úteis.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{selectedPayment.courseName}</div>
                <div className="text-sm text-muted-foreground">
                  Valor: {formatCurrency(selectedPayment.amount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Pago em:{" "}
                  {new Date(selectedPayment.createdAt).toLocaleDateString(
                    "pt-BR"
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund-reason">
                  Motivo do reembolso (opcional)
                </Label>
                <Textarea
                  id="refund-reason"
                  placeholder="Descreva o motivo da solicitação de reembolso..."
                  value={refundForm.reason}
                  onChange={(e) =>
                    setRefundForm({ ...refundForm, reason: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Importante:</strong> Reembolsos podem levar de 5 a 10
                  dias úteis para serem processados após aprovação.
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={requestRefund}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Solicitar Reembolso"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRefundDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
