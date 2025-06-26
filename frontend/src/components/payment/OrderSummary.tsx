import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Tag, Calculator } from "lucide-react";

interface Course {
  id: string;
  title: string;
  price: number;
  description?: string;
}

interface CouponValidation {
  isValid: boolean;
  discount: {
    type: "PERCENTAGE" | "FLAT_RATE";
    value: number;
    amount: number;
  };
  message?: string;
}

interface FeeCalculation {
  subtotal: number;
  discount: number;
  platformFee: number;
  processingFee: number;
  total: number;
  instructorAmount: number;
}

interface OrderSummaryProps {
  course: Course;
  feeCalculation: FeeCalculation | null;
  appliedCoupon: CouponValidation | null;
  formatCurrency: (amount: number) => string;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
}

export function OrderSummary({
  course,
  feeCalculation,
  appliedCoupon,
  formatCurrency,
  paymentType,
}: OrderSummaryProps) {
  const isSubscription = paymentType === "SUBSCRIPTION";

  return (
    <Card className="shadow-sm sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="w-5 h-5" />
          Resumo do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm">{course.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {isSubscription ? "Preço mensal" : "Preço único"}
            </span>
            <span className="font-medium">
              {formatCurrency(
                isSubscription ? course.price / 12 : course.price
              )}
            </span>
          </div>
        </div>

        
        {appliedCoupon && (
          <div className="space-y-2">
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm">Desconto aplicado</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {appliedCoupon.discount.type === "PERCENTAGE"
                  ? `${appliedCoupon.discount.value}%`
                  : formatCurrency(appliedCoupon.discount.value)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Economia</span>
              <span className="text-sm text-green-600 font-medium">
                -{formatCurrency(appliedCoupon.discount.amount)}
              </span>
            </div>
          </div>
        )}

        
        {feeCalculation && (
          <div className="space-y-2">
            <Separator />
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Detalhamento</span>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(feeCalculation.subtotal)}</span>
              </div>

              {feeCalculation.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="text-green-600">
                    -{formatCurrency(feeCalculation.discount)}
                  </span>
                </div>
              )}

              {feeCalculation.platformFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Taxa da plataforma
                  </span>
                  <span>{formatCurrency(feeCalculation.platformFee)}</span>
                </div>
              )}

              {feeCalculation.processingFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Taxa de processamento
                  </span>
                  <span>{formatCurrency(feeCalculation.processingFee)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        
        <div className="space-y-2">
          <Separator />
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">
              {formatCurrency(feeCalculation?.total || course.price)}
            </span>
          </div>
          {isSubscription && (
            <p className="text-xs text-muted-foreground">
              Valor será cobrado mensalmente
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

