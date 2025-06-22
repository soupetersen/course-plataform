import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign } from "lucide-react";

interface FeeCalculation {
  subtotal: number;
  discount: number;
  platformFee: number;
  processingFee: number;
  total: number;
  instructorAmount: number;
}

interface PriceBreakdownProps {
  feeCalculation: FeeCalculation;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  formatCurrency: (amount: number) => string;
}

export function PriceBreakdown({
  feeCalculation,
  paymentType,
  formatCurrency,
}: PriceBreakdownProps) {
  const isSubscription = paymentType === "SUBSCRIPTION";
  const divisor = isSubscription ? 12 : 1;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <DollarSign className="w-6 h-6" />
          Detalhamento do Preço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-base">
              {isSubscription ? "Valor mensal" : "Subtotal"}
            </span>
            <span className="font-semibold text-base">
              {formatCurrency(feeCalculation.subtotal / divisor)}
            </span>
          </div>

          {feeCalculation.discount > 0 && (
            <div className="flex justify-between items-center py-2 text-green-600">
              <span className="text-base">Desconto</span>
              <span className="font-semibold text-base">
                -{formatCurrency(feeCalculation.discount / divisor)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 text-muted-foreground">
            <span>Taxa da plataforma</span>
            <span>{formatCurrency(feeCalculation.platformFee / divisor)}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-muted-foreground">
            <span>Taxa de processamento</span>
            <span>
              {formatCurrency(feeCalculation.processingFee / divisor)}
            </span>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between items-center py-3 font-semibold text-xl">
            <span>{isSubscription ? "Total mensal" : "Total"}</span>
            <span className="text-2xl">
              {formatCurrency(feeCalculation.total / divisor)}
            </span>
          </div>

          <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            Instrutor recebe:{" "}
            <span className="font-medium">
              {formatCurrency(feeCalculation.instructorAmount / divisor)}
              {isSubscription && " por mês"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
