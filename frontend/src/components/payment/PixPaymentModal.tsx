import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import QRCode from "qrcode";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: {
    qrCode: string;
    qrCodeBase64?: string;
    amount: number;
    currency: string;
    paymentId: string;
    expirationDate?: string; // Data de expiração do PIX
    expirationMinutes?: number; // Minutos de expiração configurados
  };
  onPaymentConfirmed?: () => void;
}

export function PixPaymentModal({
  isOpen,
  onClose,
  pixData,
  onPaymentConfirmed,
}: PixPaymentModalProps) {
  // Calcular tempo de expiração real baseado nos dados do backend
  const getInitialTimeLeft = useCallback(() => {
    if (pixData.expirationDate) {
      const now = new Date();
      const expiration = new Date(pixData.expirationDate);

      console.log("🕐 Cálculo de expiração PIX:");
      console.log("  - Data atual:", now.toISOString());
      console.log("  - Data atual local:", now.toLocaleString("pt-BR"));
      console.log("  - Data de expiração:", expiration.toISOString());
      console.log(
        "  - Data de expiração local:",
        expiration.toLocaleString("pt-BR")
      );
      console.log("  - Data recebida (string):", pixData.expirationDate);

      const timeLeftMs = expiration.getTime() - now.getTime();
      const timeLeftSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));

      console.log("  - Diferença timestamp (ms):", timeLeftMs);
      console.log("  - Tempo restante (segundos):", timeLeftSeconds);
      console.log(
        "  - Tempo restante (minutos):",
        Math.floor(timeLeftSeconds / 60)
      );

      // Se o tempo calculado for negativo ou muito pequeno, usar fallback
      if (timeLeftSeconds <= 10) {
        console.log("⚠️ Tempo muito pequeno, usando fallback");
        const fallbackTime = pixData.expirationMinutes
          ? pixData.expirationMinutes * 60
          : 900;
        console.log("  - Tempo fallback:", fallbackTime, "segundos");
        return fallbackTime;
      }

      return timeLeftSeconds;
    }
    // Fallback para tempo padrão se não tiver dados de expiração
    const fallbackTime = pixData.expirationMinutes
      ? pixData.expirationMinutes * 60
      : 900;
    console.log("⚠️ Usando tempo padrão:", fallbackTime, "segundos");
    return fallbackTime;
  }, [pixData.expirationDate, pixData.expirationMinutes]);

  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "confirmed" | "expired"
  >("pending");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [generatedQrCode, setGeneratedQrCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Gerar QR Code se não vier da API
  useEffect(() => {
    const generateQrCode = async () => {
      if (!pixData.qrCodeBase64 && pixData.qrCode) {
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(pixData.qrCode, {
            width: 256,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          setGeneratedQrCode(qrCodeDataUrl);
        } catch (error) {
          console.error("Erro ao gerar QR Code:", error);
        }
      }
    };

    if (isOpen) {
      generateQrCode();
    }
  }, [isOpen, pixData.qrCode, pixData.qrCodeBase64]);

  // Recalcular timeLeft quando pixData mudar
  useEffect(() => {
    setTimeLeft(getInitialTimeLeft());
  }, [getInitialTimeLeft]);

  useEffect(() => {
    if (!isOpen || paymentStatus !== "pending") return;

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
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

    checkPaymentStatus();

    let pollInterval = 5000;
    const maxInterval = 30000;

    const scheduleNextCheck = () => {
      setTimeout(() => {
        if (paymentStatus === "pending" && isOpen) {
          checkPaymentStatus().then(() => {
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
      <DialogContent className="max-w-sm mx-auto p-3">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-center text-sm">
            {paymentStatus === "pending" && "Pagamento via PIX"}
            {paymentStatus === "confirmed" && "Pagamento Confirmado!"}
            {paymentStatus === "expired" && "PIX Expirado"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Card>
            <CardContent className="pt-2 pb-2">
              <div className="text-center space-y-1">
                {paymentStatus === "pending" && (
                  <>
                    <Clock className="w-4 h-4 mx-auto text-blue-500" />
                    <p className="text-xs text-gray-600">
                      {isCheckingStatus
                        ? "Verificando..."
                        : "Aguardando pagamento"}
                    </p>
                    <div className="text-sm font-bold text-blue-600">
                      {formatTime(timeLeft)}
                    </div>
                    {isCheckingStatus && (
                      <div className="flex items-center justify-center space-x-1">
                        <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-gray-500">
                          Verificando...
                        </span>
                      </div>
                    )}
                  </>
                )}

                {paymentStatus === "confirmed" && (
                  <>
                    <CheckCircle className="w-4 h-4 mx-auto text-green-500" />
                    <p className="text-xs text-green-600 font-medium">
                      Pagamento confirmado!
                    </p>
                  </>
                )}

                {paymentStatus === "expired" && (
                  <>
                    <AlertCircle className="w-4 h-4 mx-auto text-red-500" />
                    <p className="text-xs text-red-600 font-medium">
                      PIX expirado
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-1 pb-1">
              <div className="text-center">
                <p className="text-xs text-gray-600">Valor</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(pixData.amount, pixData.currency)}
                </p>
              </div>
            </CardContent>
          </Card>

          {paymentStatus === "pending" && (
            <>
              {/* QR Code - da API ou gerado localmente */}
              {(pixData.qrCodeBase64 || generatedQrCode) && (
                <Card>
                  <CardContent className="pt-2 pb-1">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">QR Code</p>
                      <img
                        src={
                          pixData.qrCodeBase64
                            ? `data:image/png;base64,${pixData.qrCodeBase64}`
                            : generatedQrCode || ""
                        }
                        alt="QR Code PIX"
                        className="w-28 h-28 mx-auto border rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {pixData.qrCodeBase64
                          ? "Mercado Pago"
                          : "Gerado automaticamente"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-2 pb-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 text-center">
                      Código PIX
                    </p>
                    <div className="p-1 bg-gray-50 rounded border">
                      <p
                        className="text-xs font-mono break-all text-gray-700 overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {pixData.qrCode}
                      </p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(pixData.qrCode)}
                      className="w-full h-7"
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      <span className="text-xs">Copiar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex gap-2 pt-1">
            {paymentStatus === "expired" && (
              <Button onClick={onClose} className="flex-1 h-8" size="sm">
                <span className="text-xs">Gerar novo PIX</span>
              </Button>
            )}
            {paymentStatus === "pending" && (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-8"
                size="sm"
              >
                <span className="text-xs">Cancelar</span>
              </Button>
            )}
            {paymentStatus === "confirmed" && (
              <Button onClick={handleClose} className="w-full h-8" size="sm">
                <span className="text-xs">Continuar</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
