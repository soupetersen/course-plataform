import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Gift } from "lucide-react";
import { PAYMENT_GATEWAYS } from "@/services/payment";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

import { PaymentTypeSelector } from "./PaymentTypeSelector";
import { GatewaySelection } from "./GatewaySelection";
import { PaymentMethodSelection } from "./PaymentMethodSelection";
import { CouponSection } from "./CouponSection";
import { CourseSummary } from "./CourseSummary";
import { PriceBreakdown } from "./PriceBreakdown";
import { PaymentButton } from "./PaymentButton";

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
  const [selectedGateway] = useState<"MERCADOPAGO">("MERCADOPAGO");
  const [paymentType, setPaymentType] = useState<"ONE_TIME" | "SUBSCRIPTION">(
    "ONE_TIME"
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("PIX");
  const { toast } = useToast();

  useEffect(() => {
    if (
      paymentType === "SUBSCRIPTION" &&
      selectedPaymentMethod !== "CREDIT_CARD"
    ) {
      setSelectedPaymentMethod("CREDIT_CARD");
    }
  }, [paymentType, selectedPaymentMethod]);

  const calculateFees = useCallback(async () => {
    try {
      const response = await api.post("/api/payments/calculate-fees", {
        courseId: course.id,
        discountAmount: appliedCoupon?.discount.amount || 0,
      });

      if (response.data && response.data.calculation) {
        setFeeCalculation(response.data.calculation);
      }
    } catch (error) {
      console.error("Error calculating fees:", error);
    }
  }, [course.id, appliedCoupon?.discount.amount]);

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
      const response = await api.post("/api/payments/validate-coupon", {
        code: couponCode,
        courseId: course.id,
      });

      if (response.data && response.data.isValid) {
        setAppliedCoupon(response.data);
        toast({
          title: "Cupom aplicado!",
          description: `Desconto de ${formatDiscount(
            response.data.discount
          )} aplicado`,
        });
      } else {
        toast({
          title: "Cupom inválido",
          description:
            response.data?.message || "Código de cupom inválido ou expirado",
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
    toast({
      title: "Cupom removido",
      description: "O desconto foi removido do pedido",
    });
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);

    console.log("DEBUG - PaymentCheckout processPayment:");
    console.log("- paymentType:", paymentType);
    console.log("- selectedGateway:", selectedGateway);
    console.log("- selectedPaymentMethod:", selectedPaymentMethod);

    try {
      const endpoint =
        paymentType === "SUBSCRIPTION"
          ? "/api/payments/subscription"
          : "/api/payments/one-time";

      const paymentData = {
        courseId: course.id,
        amount: feeCalculation?.total || course.price,
        couponCode: appliedCoupon ? couponCode : undefined,
        gateway: selectedGateway,
        paymentMethod: selectedPaymentMethod,
        currency: "BRL",
        gatewayType: "MERCADOPAGO",
      };

      const response = await api.post(endpoint, paymentData);

      if (response.data) {
        if (response.data.url) {
          // Redirect para gateway externo (Mercado Pago)
          window.location.href = response.data.url;
        } else {
          onPaymentSuccess(response.data.paymentId);
        }
      } else {
        const errorMessage = "Erro ao processar pagamento";
        toast({
          title: "Erro no pagamento",
          description: errorMessage,
          variant: "destructive",
        });
        onPaymentError(errorMessage);
      }
    } catch (error) {
      console.error("Erro no processamento do pagamento:", error);
      let errorMessage =
        "Erro de conexão. Verifique sua internet e tente novamente.";

      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          errorMessage;
      }

      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });
      onPaymentError(errorMessage);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="w-6 h-6" />
                  Opções de Pagamento
                </CardTitle>
                <CardDescription className="text-base">
                  Escolha o tipo de pagamento e método preferido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PaymentTypeSelector
                  paymentType={paymentType}
                  onPaymentTypeChange={setPaymentType}
                  coursePrice={course.price}
                  formatCurrency={formatCurrency}
                />

                <GatewaySelection />

                <PaymentMethodSelection
                  gateway={PAYMENT_GATEWAYS[selectedGateway]}
                  selectedMethod={selectedPaymentMethod}
                  onMethodChange={setSelectedPaymentMethod}
                  paymentType={paymentType}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <CourseSummary course={course} formatCurrency={formatCurrency} />

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="w-5 h-5 text-green-600" />
                  Cupom de Desconto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CouponSection
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  appliedCoupon={appliedCoupon}
                  isValidatingCoupon={isValidatingCoupon}
                  onValidateCoupon={validateCoupon}
                  onRemoveCoupon={removeCoupon}
                  formatDiscount={formatDiscount}
                />
              </CardContent>
            </Card>

            {feeCalculation && (
              <PriceBreakdown
                feeCalculation={feeCalculation}
                paymentType={paymentType}
                formatCurrency={formatCurrency}
              />
            )}

            <PaymentButton
              isProcessingPayment={isProcessingPayment}
              paymentType={paymentType}
              feeCalculation={feeCalculation}
              selectedGateway={selectedGateway}
              formatCurrency={formatCurrency}
              onProcessPayment={processPayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
