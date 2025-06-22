import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  CreditCard,
  Zap,
  FileText,
  Tag,
  Calculator,
  Loader2,
  Shield,
} from "lucide-react";

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

interface CheckoutStepProps {
  course: Course;
  selectedPaymentMethod: string;
  feeCalculation: FeeCalculation | null;
  appliedCoupon: CouponValidation | null;
  formatCurrency: (amount: number) => string;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  isProcessingPayment: boolean;
  onProcessPayment: () => void;
  onBack: () => void;
}

export function CheckoutStep({
  course,
  selectedPaymentMethod,
  feeCalculation,
  appliedCoupon,
  formatCurrency,
  paymentType,
  isProcessingPayment,
  onProcessPayment,
  onBack,
}: CheckoutStepProps) {
  const isSubscription = paymentType === "SUBSCRIPTION";
  const total = feeCalculation?.total || course.price;

  const getPaymentMethodIcon = () => {
    switch (selectedPaymentMethod) {
      case "PIX":
        return <Zap className="w-4 h-4 text-green-600" />;
      case "CREDIT_CARD":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "BOLETO":
        return <FileText className="w-4 h-4 text-orange-600" />;
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

  const getPaymentMethodBadge = () => {
    switch (selectedPaymentMethod) {
      case "PIX":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Instantâneo
          </Badge>
        );
      case "CREDIT_CARD":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Aprovação rápida
          </Badge>
        );
      case "BOLETO":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            3 dias úteis
          </Badge>
        );
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (isProcessingPayment) {
      return "Processando...";
    }

    switch (selectedPaymentMethod) {
      case "PIX":
        return `Pagar ${formatCurrency(total)} via PIX`;
      case "CREDIT_CARD":
        return `Finalizar Pagamento ${formatCurrency(total)}`;
      case "BOLETO":
        return `Gerar Boleto ${formatCurrency(total)}`;
      default:
        return `Pagar ${formatCurrency(total)}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-400">
        <h2 className="text-2xl font-bold">Finalizar Pagamento</h2>
        <p className="text-muted-foreground">
          Revise seus dados e confirme a compra
        </p>
      </div>

      {/* Course Summary */}
      <Card className="shadow-sm animate-in zoom-in-95 fade-in duration-500 delay-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Resumo do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Info */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                {isSubscription ? "Assinatura mensal" : "Compra única"}
              </p>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {formatCurrency(
                  isSubscription ? course.price / 12 : course.price
                )}
              </div>
              {isSubscription && (
                <div className="text-xs text-muted-foreground">/mês</div>
              )}
            </div>
          </div>

          {/* Applied Coupon */}
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

          {/* Fee Breakdown */}
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

          {/* Total */}
          <div className="space-y-2">
            <Separator />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            {isSubscription && (
              <p className="text-xs text-muted-foreground">
                Valor será cobrado mensalmente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Confirmation */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPaymentMethodIcon()}
            Método de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{getPaymentMethodName()}</span>
              {getPaymentMethodBadge()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={isProcessingPayment}
            >
              Alterar
            </Button>
          </div>

          {/* Payment Method Info */}
          <div className="mt-3 text-sm text-muted-foreground">
            {selectedPaymentMethod === "PIX" && (
              <p>
                Após confirmar, você receberá um QR Code para pagamento
                instantâneo.
              </p>
            )}
            {selectedPaymentMethod === "CREDIT_CARD" && (
              <p>
                Seu cartão será processado de forma segura pelo Mercado Pago.
              </p>
            )}
            {selectedPaymentMethod === "BOLETO" && (
              <p>O boleto será gerado para pagamento em até 3 dias úteis.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security and Action */}
      <Card className="shadow-sm animate-in slide-in-from-bottom-6 fade-in duration-600 delay-300">
        <CardContent className="p-6 space-y-4">
          {/* Security info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-500 delay-500">
            <Shield className="w-4 h-4" />
            <span>Pagamento 100% seguro e criptografado</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-600">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isProcessingPayment}
              className="flex-1 hover:scale-[1.02] transition-transform"
            >
              Voltar
            </Button>
            <Button
              onClick={onProcessPayment}
              disabled={isProcessingPayment}
              size="lg"
              className="flex-1 font-semibold hover:scale-[1.02] transition-transform"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {selectedPaymentMethod === "BOLETO" ? (
                    <FileText className="w-4 h-4 mr-2" />
                  ) : selectedPaymentMethod === "PIX" ? (
                    <Zap className="w-4 h-4 mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {getButtonText()}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
