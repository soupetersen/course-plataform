import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Zap, Shield, FileText } from "lucide-react";

interface FeeCalculation {
  subtotal: number;
  discount: number;
  platformFee: number;
  processingFee: number;
  total: number;
  instructorAmount: number;
}

interface PaymentActionButtonProps {
  isProcessingPayment: boolean;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  selectedPaymentMethod: string;
  feeCalculation: FeeCalculation | null;
  coursePrice: number;
  formatCurrency: (amount: number) => string;
  onProcessPayment: () => void;
  disabled?: boolean;
}

export function PaymentActionButton({
  isProcessingPayment,
  paymentType,
  selectedPaymentMethod,
  feeCalculation,
  coursePrice,
  formatCurrency,
  onProcessPayment,
  disabled = false,
}: PaymentActionButtonProps) {
  const total = feeCalculation?.total || coursePrice;
  const isSubscription = paymentType === "SUBSCRIPTION";

  const getPaymentMethodIcon = () => {
    switch (selectedPaymentMethod) {
      case "PIX":
        return <Zap className="w-4 h-4" />;
      case "CREDIT_CARD":
        return <CreditCard className="w-4 h-4" />;
      case "BOLETO":
        return <FileText className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentMethodName = () => {
    switch (selectedPaymentMethod) {
      case "PIX":
        return "PIX";
      case "CREDIT_CARD":
        return "Cartão de Crédito";
      case "BOLETO":
        return "Boleto Bancário";
      default:
        return "Cartão";
    }
  };

  const getButtonText = () => {
    if (isProcessingPayment) {
      return "Processando...";
    }

    if (selectedPaymentMethod === "PIX") {
      return `Pagar ${formatCurrency(total)} via PIX`;
    }

    if (selectedPaymentMethod === "CREDIT_CARD") {
      return `Finalizar Pagamento ${formatCurrency(total)}`;
    }

    if (selectedPaymentMethod === "BOLETO") {
      return `Gerar Boleto ${formatCurrency(total)}`;
    }

    return `Pagar ${formatCurrency(total)}`;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 space-y-4">
        {/* Payment method info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPaymentMethodIcon()}
            <span className="font-medium">{getPaymentMethodName()}</span>
            {selectedPaymentMethod === "PIX" && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Instantâneo
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{formatCurrency(total)}</div>
            {isSubscription && (
              <div className="text-xs text-muted-foreground">/mês</div>
            )}
          </div>
        </div>

        {/* Security info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Pagamento 100% seguro e criptografado</span>
        </div>

        {/* Action button */}
        <Button
          onClick={onProcessPayment}
          disabled={disabled || isProcessingPayment}
          size="lg"
          className="w-full font-semibold"
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              {getPaymentMethodIcon()}
              <span className="ml-2">{getButtonText()}</span>
            </>
          )}
        </Button>

        {/* Additional info for PIX */}
        {selectedPaymentMethod === "PIX" && !isProcessingPayment && (
          <div className="text-xs text-center text-muted-foreground">
            Após clicar em pagar, você receberá um QR Code para escaneá-lo no
            seu app do banco
          </div>
        )}

        {/* Additional info for Credit Card */}
        {selectedPaymentMethod === "CREDIT_CARD" && !isProcessingPayment && (
          <div className="text-xs text-center text-muted-foreground">
            Seu cartão será processado de forma segura pelo Mercado Pago
          </div>
        )}

        {/* Additional info for Boleto */}
        {selectedPaymentMethod === "BOLETO" && !isProcessingPayment && (
          <div className="text-xs text-center text-muted-foreground">
            O boleto será gerado e você poderá imprimi-lo ou copiá-lo para pagar
            no banco
          </div>
        )}
      </CardContent>
    </Card>
  );
}
