import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";

interface PaymentButtonProps {
  isProcessingPayment: boolean;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  feeCalculation: {
    total: number;
  } | null;
  selectedGateway: "MERCADOPAGO";
  formatCurrency: (amount: number) => string;
  onProcessPayment: () => void;
}

export function PaymentButton({
  isProcessingPayment,
  paymentType,
  feeCalculation,
  selectedGateway,
  formatCurrency,
  onProcessPayment,
}: PaymentButtonProps) {
  const isSubscription = paymentType === "SUBSCRIPTION";
  const total = feeCalculation?.total || 0;
  const displayTotal = isSubscription ? total / 12 : total;

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <Button
          onClick={onProcessPayment}
          disabled={isProcessingPayment}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              {isSubscription ? "Assinar Curso" : "Finalizar Pagamento"}
              {feeCalculation && ` - ${formatCurrency(displayTotal)}`}
              {isSubscription && "/mês"}
            </>
          )}
        </Button>

        <div className="mt-4 text-sm text-center text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>
              Pagamento seguro processado pelo{" "}
              {selectedGateway === "MERCADOPAGO" ? "Mercado Pago" : "Gateway"}
            </span>
          </div>
          <div className="text-xs">
            Seus dados estão protegidos com criptografia SSL
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
