import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Tag, Check, X, CreditCard, DollarSign } from "lucide-react";

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
  stripeFee: number;
  total: number;
  instructorAmount: number;
}

interface PaymentCheckoutProps {
  course: Course;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentCheckout({
  course,
  onPaymentSuccess,
  onPaymentError,
}: PaymentCheckoutProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(
    null
  );
  const [feeCalculation, setFeeCalculation] = useState<FeeCalculation | null>(
    null
  );
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const { toast } = useToast();

  const calculateFees = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/payments/calculate-fees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalAmount: course.price,
          discountAmount: appliedCoupon?.discount.amount || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeeCalculation(data.calculation);
      } else {
        console.error("Failed to calculate fees");
      }
    } catch (error) {
      console.error("Error calculating fees:", error);
    }
  }, [course.price, appliedCoupon?.discount.amount]);

  useEffect(() => {
    calculateFees();
  }, [calculateFees]);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código de cupom",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/payments/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          coursePrice: course.price,
        }),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        setAppliedCoupon(data);
        toast({
          title: "Cupom aplicado!",
          description: `Desconto de ${formatDiscount(data.discount)} aplicado`,
        });
      } else {
        toast({
          title: "Cupom inválido",
          description: data.message || "Código de cupom inválido ou expirado",
          variant: "destructive",
        });
        setAppliedCoupon(null);
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao validar cupom",
        variant: "destructive",
      });
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setShowCouponInput(false);
    toast({
      title: "Cupom removido",
      description: "O desconto foi removido do pedido",
    });
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/payments/one-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: course.id,
          amount: feeCalculation?.total || course.price,
          couponCode: appliedCoupon ? couponCode : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.url) {
          window.location.href = data.url;
        } else {
          onPaymentSuccess(data.paymentId);
        }
      } else {
        onPaymentError(data.message || "Erro ao processar pagamento");
      }
    } catch {
      onPaymentError("Erro de conexão");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatDiscount = (discount: CouponValidation["discount"]) => {
    if (discount.type === "PERCENTAGE") {
      return `${discount.value}%`;
    } else {
      return `R$ ${discount.value.toFixed(2)}`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Resumo do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {course.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(course.price)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Cupom de Desconto
          </CardTitle>
          <CardDescription>
            Tem um cupom? Digite o código para aplicar desconto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!appliedCoupon && !showCouponInput && (
            <Button
              variant="outline"
              onClick={() => setShowCouponInput(true)}
              className="w-full"
            >
              <Tag className="w-4 h-4 mr-2" />
              Adicionar Cupom de Desconto
            </Button>
          )}

          {!appliedCoupon && showCouponInput && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o código do cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={isValidatingCoupon}
                />
                <Button
                  onClick={validateCoupon}
                  disabled={isValidatingCoupon || !couponCode.trim()}
                >
                  {isValidatingCoupon ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Aplicar"
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCouponInput(false)}
              >
                Cancelar
              </Button>
            </div>
          )}

          {appliedCoupon && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800 dark:text-green-200">
                      Cupom "{couponCode}" aplicado
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-300">
                      Desconto: {formatDiscount(appliedCoupon.discount)}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={removeCoupon}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      {feeCalculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Detalhamento do Preço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(feeCalculation.subtotal)}</span>
              </div>

              {feeCalculation.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(feeCalculation.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxa da plataforma</span>
                <span>{formatCurrency(feeCalculation.platformFee)}</span>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxa de processamento</span>
                <span>{formatCurrency(feeCalculation.stripeFee)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(feeCalculation.total)}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                Instrutor recebe:{" "}
                {formatCurrency(feeCalculation.instructorAmount)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={processPayment}
            disabled={isProcessingPayment}
            className="w-full"
            size="lg"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Finalizar Pagamento{" "}
                {feeCalculation && `- ${formatCurrency(feeCalculation.total)}`}
              </>
            )}
          </Button>

          <div className="mt-3 text-xs text-center text-muted-foreground">
            Pagamento seguro processado pelo Stripe
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
