import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: {
    qrCode: string;
    qrCodeBase64?: string;
    amount: number;
    currency: string;
    paymentId: string;
  };
  onPaymentConfirmed?: () => void;
}

export function PixPaymentModal({
  isOpen,
  onClose,
  pixData,
  onPaymentConfirmed,
}: PixPaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(900);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "confirmed" | "expired"
  >("pending");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || paymentStatus !== "pending") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus("expired");
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymentStatus]);

  useEffect(() => {
    if (!isOpen || paymentStatus !== "pending") return;

    const checkPaymentStatus = async () => {
      try {
        setIsCheckingStatus(true);

        const response = await api.get(
          `/api/payments/${pixData.paymentId}/status`
        );

        console.log("Status do pagamento:", response.data);

        if (response.data.success && response.data.data) {
          const status = response.data.data.status;

          if (status === "COMPLETED" || status === "APPROVED") {
            setPaymentStatus("confirmed");
            toast({
              title: "Pagamento confirmado!",
              description: "Seu pagamento foi processado com sucesso.",
            });
          } else if (
            status === "FAILED" ||
            status === "REJECTED" ||
            status === "CANCELLED"
          ) {
            setPaymentStatus("expired");
            toast({
              title: "Pagamento falhou",
              description: "Houve um problema com o pagamento.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Erro na verificação do pagamento:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    // Verificar status inicial imediatamente
    checkPaymentStatus();

    // Configurar polling com backoff exponencial
    let pollInterval = 5000; // Começar com 5 segundos
    const maxInterval = 30000; // Máximo de 30 segundos

    const scheduleNextCheck = () => {
      setTimeout(() => {
        if (paymentStatus === "pending" && isOpen) {
          checkPaymentStatus().then(() => {
            // Aumentar o intervalo gradualmente para reduzir carga
            pollInterval = Math.min(pollInterval * 1.2, maxInterval);
            scheduleNextCheck();
          });
        }
      }, pollInterval);
    };

    scheduleNextCheck();
  }, [isOpen, paymentStatus, pixData.paymentId, toast]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formatCurrency = (amount: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (paymentStatus === "confirmed" && onPaymentConfirmed) {
      onPaymentConfirmed();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {paymentStatus === "pending" && "Pagamento via PIX"}
            {paymentStatus === "confirmed" && "Pagamento Confirmado!"}
            {paymentStatus === "expired" && "PIX Expirado"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status do Pagamento */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                {paymentStatus === "pending" && (
                  <>
                    <Clock className="w-8 h-8 mx-auto text-blue-500" />
                    <p className="text-sm text-gray-600">
                      {isCheckingStatus
                        ? "Verificando pagamento..."
                        : "Aguardando pagamento"}
                    </p>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatTime(timeLeft)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Tempo restante para pagamento
                    </p>
                    {isCheckingStatus && (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-gray-500">
                          Verificando...
                        </span>
                      </div>
                    )}
                  </>
                )}

                {paymentStatus === "confirmed" && (
                  <>
                    <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                    <p className="text-sm text-green-600 font-medium">
                      Pagamento confirmado!
                    </p>
                  </>
                )}

                {paymentStatus === "expired" && (
                  <>
                    <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                    <p className="text-sm text-red-600 font-medium">
                      PIX expirado
                    </p>
                    <p className="text-xs text-gray-500">
                      Gere um novo código para continuar
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Valor do Pagamento */}
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Valor a pagar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(pixData.amount, pixData.currency)}
                </p>
              </div>
            </CardContent>
          </Card>

          {paymentStatus === "pending" && (
            <>
              {/* QR Code */}
              {pixData.qrCodeBase64 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-sm">
                      Escaneie o QR Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 border rounded"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Código PIX */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-sm">
                    Ou copie o código PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-xs font-mono break-all text-gray-700">
                      {pixData.qrCode}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(pixData.qrCode)}
                    className="w-full"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar código PIX
                  </Button>
                </CardContent>
              </Card>

              {/* Instruções */}
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="font-medium">Como pagar:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Abra o app do seu banco</li>
                      <li>Escolha a opção PIX</li>
                      <li>Escaneie o QR Code ou cole o código</li>
                      <li>Confirme o pagamento</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            {paymentStatus === "expired" && (
              <Button onClick={onClose} className="flex-1">
                Gerar novo PIX
              </Button>
            )}
            {paymentStatus === "pending" && (
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancelar
              </Button>
            )}
            {paymentStatus === "confirmed" && (
              <Button onClick={handleClose} className="w-full">
                Continuar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
