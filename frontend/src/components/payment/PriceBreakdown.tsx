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
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg lg:text-xl min-w-0">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
          <span className="truncate">
            <span className="hidden sm:inline">Detalhamento do Preço</span>
            <span className="sm:hidden">Preço</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm sm:text-base truncate flex-1">
              {isSubscription ? "Valor mensal" : "Subtotal"}
            </span>
            <span className="font-semibold text-sm sm:text-base whitespace-nowrap ml-2">
              {formatCurrency(feeCalculation.subtotal / divisor)}
            </span>
          </div>

          {feeCalculation.discount > 0 && (
            <div className="flex justify-between items-center py-2 text-green-600">
              <span className="text-sm sm:text-base truncate flex-1">
                Desconto
              </span>
              <span className="font-semibold text-sm sm:text-base whitespace-nowrap ml-2">
                -{formatCurrency(feeCalculation.discount / divisor)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 text-muted-foreground">
            <span className="text-sm truncate flex-1">Taxa da plataforma</span>
            <span className="text-sm whitespace-nowrap ml-2">
              {formatCurrency(feeCalculation.platformFee / divisor)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 text-muted-foreground">
            <span className="text-sm truncate flex-1">
              Taxa de processamento
            </span>
            <span className="text-sm whitespace-nowrap ml-2">
              {formatCurrency(feeCalculation.processingFee / divisor)}
            </span>
          </div>

          <Separator className="my-3 sm:my-4" />

          <div className="flex justify-between items-center py-2 sm:py-3 font-semibold text-lg sm:text-xl">
            <span className="truncate flex-1">
              {isSubscription ? "Total mensal" : "Total"}
            </span>
            <span className="text-lg sm:text-2xl whitespace-nowrap ml-2">
              {formatCurrency(feeCalculation.total / divisor)}
            </span>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-lg break-words">
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

