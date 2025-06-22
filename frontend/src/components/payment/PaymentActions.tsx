import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";

interface PaymentActionsProps {
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  isProcessing: boolean;
  onPayment: () => void;
  onCancel: () => void;
}

export function PaymentActions({
  paymentType,
  isProcessing,
  onPayment,
  onCancel,
}: PaymentActionsProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 space-y-4">
        <Button
          onClick={onPayment}
          disabled={isProcessing}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              {paymentType === "ONE_TIME"
                ? "Finalizar Pagamento"
                : "Assinar Curso"}
            </>
          )}
        </Button>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Pagamento seguro processado pelo Mercado Pago</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Seus dados estão protegidos com criptografia SSL
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
          disabled={isProcessing}
        >
          Cancelar e voltar ao curso
        </Button>
      </CardContent>
    </Card>
  );
}
