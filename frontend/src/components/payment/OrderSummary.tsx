import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Receipt } from "lucide-react";
import { type OrderSummaryResponse } from "@/services/payment";

interface OrderSummaryProps {
  orderSummary: OrderSummaryResponse["data"];
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  frequency: number;
  frequencyType: "months" | "weeks" | "days" | "years";
}

export function OrderSummary({
  orderSummary,
  paymentType,
  frequency,
  frequencyType,
}: OrderSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getFrequencyText = () => {
    const typeMap = {
      days: "dia(s)",
      weeks: "semana(s)",
      months: "mês(es)",
      years: "ano(s)",
    };
    return `${frequency} ${typeMap[frequencyType]}`;
  };

  if (!orderSummary) return null;

  return (
    <Card className="shadow-sm sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Receipt className="w-6 h-6" />
          Resumo do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Curso de thiago</h3>
              <p className="text-sm text-muted-foreground mt-1">
                emersive.com.br
              </p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">
                {formatCurrency(orderSummary.originalPrice)}
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base">
              {paymentType === "SUBSCRIPTION" ? "Valor mensal" : "Subtotal"}
            </span>
            <span className="font-semibold">
              {formatCurrency(orderSummary.originalPrice)}
            </span>
          </div>

          {orderSummary.discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Desconto</span>
              <span className="font-semibold">
                -{formatCurrency(orderSummary.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-muted-foreground">
            <span>Taxa da plataforma</span>
            <span>{formatCurrency(orderSummary.platformFee || 0)}</span>
          </div>

          <div className="flex justify-between items-center text-muted-foreground">
            <span>Taxa de processamento</span>
            <span>
              {formatCurrency(orderSummary.processingFeeEstimate || 0)}
            </span>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between items-center text-xl font-bold">
            <span>
              {paymentType === "SUBSCRIPTION" ? "Total mensal" : "Total"}
            </span>
            <span className="text-2xl text-green-600">
              {formatCurrency(orderSummary.finalPrice)}
            </span>
          </div>

          {paymentType === "SUBSCRIPTION" && (
            <div className="text-sm text-center text-muted-foreground mt-2">
              Cobrança a cada {getFrequencyText()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
