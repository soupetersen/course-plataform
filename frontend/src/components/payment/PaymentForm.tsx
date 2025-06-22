import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  paymentService,
  type CreatePaymentRequest,
  type CreateSubscriptionRequest,
  type OrderSummaryResponse,
  PAYMENT_GATEWAYS,
} from "@/services/payment";

// Componentes separados
import { CourseInfo } from "./CourseInfo";
import { PaymentTypeConfig } from "./PaymentTypeConfig";
import { GatewaySelection } from "./GatewaySelection";
import { PaymentMethodSelection } from "./PaymentMethodSelection";
import { CouponManagement } from "./CouponManagement";
import { OrderSummary } from "./OrderSummary";
import { PaymentActions } from "./PaymentActions";
import { PixPaymentModal } from "./PixPaymentModal";

interface Course {
  id: string;
  title: string;
  price: number;
  description?: string;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
}

interface PaymentFormProps {
  course: Course;
  onPaymentSuccess: (
    paymentId: string,
    type: "payment" | "subscription"
  ) => void;
  onCancel: () => void;
}

export function PaymentForm({
  course,
  onPaymentSuccess,
  onCancel,
}: PaymentFormProps) {
  const [paymentType, setPaymentType] = useState<"ONE_TIME" | "SUBSCRIPTION">(
    "ONE_TIME"
  );
  const [selectedMethod, setSelectedMethod] = useState<string>("PIX");
  const [frequency, setFrequency] = useState<number>(1);
  const [frequencyType, setFrequencyType] = useState<
    "months" | "weeks" | "days" | "years"
  >("months");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    success: boolean;
    data?: {
      couponId: string;
      discountAmount: number;
      finalAmount: number;
      discountType: string;
      discountValue: number;
    };
  } | null>(null);
  const [orderSummary, setOrderSummary] = useState<
    OrderSummaryResponse["data"] | null
  >(null);

  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Estados para o modal do PIX
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixPaymentData, setPixPaymentData] = useState<{
    qrCode: string;
    qrCodeBase64?: string;
    amount: number;
    currency: string;
    paymentId: string;
  } | null>(null);

  const { toast } = useToast();

  const loadOrderSummary = useCallback(async () => {
    try {
      const response = await paymentService.calculateOrderSummary(
        course.id,
        appliedCoupon?.data?.couponId ? couponCode : undefined
      );

      if (response.success && response.data) {
        setOrderSummary(response.data);
      }
    } catch (_error) {
      console.error("Error loading order summary:", _error);
    }
  }, [course.id, appliedCoupon?.data?.couponId, couponCode]);

  useEffect(() => {
    loadOrderSummary();
  }, [loadOrderSummary]);

  // Debug logs
  console.log("PaymentForm Debug - paymentType:", paymentType);
  console.log("PaymentForm Debug - selectedMethod:", selectedMethod);

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
      const response = await paymentService.validateCoupon(
        couponCode,
        course.price
      );

      if (response.success && response.data) {
        setAppliedCoupon(response);
        toast({
          title: "Cupom aplicado!",
          description: `Desconto de R$ ${response.data.discountAmount.toFixed(
            2
          )} aplicado`,
        });
      } else {
        toast({
          title: "Cupom inválido",
          description: response.error || "Verifique o código e tente novamente",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao validar cupom. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setShowCouponInput(false);
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (paymentType === "ONE_TIME") {
        const request: CreatePaymentRequest = {
          courseId: course.id,
          currency: "BRL",
          paymentMethod: selectedMethod,
          gatewayType: "MERCADOPAGO",
          couponCode: appliedCoupon ? couponCode : undefined,
        };

        const response = await paymentService.createOneTimePayment(request);

        if (response.success && response.data) {
          if (
            selectedMethod === "PIX" &&
            response.data.paymentData?.pixQrCode
          ) {
            console.log("PIX QR Code:", response.data.paymentData.pixQrCode);

            setPixPaymentData({
              qrCode: response.data.paymentData.pixQrCode,
              qrCodeBase64: response.data.paymentData.pixCopiaECola,
              amount: response.data.amount || course.price,
              currency: response.data.currency || "BRL",
              paymentId: response.data.paymentId,
            });
            setShowPixModal(true);
            return;
          }

          // Para outros métodos, redirecionar ou finalizar
          if (response.data.paymentData?.checkoutUrl) {
            window.location.href = response.data.paymentData.checkoutUrl;
          } else {
            onPaymentSuccess(response.data.paymentId, "payment");
          }
        } else {
          toast({
            title: "Erro no pagamento",
            description:
              response.error || "Não foi possível processar o pagamento",
            variant: "destructive",
          });
        }
      } else {
        const request: CreateSubscriptionRequest = {
          courseId: course.id,
          frequency,
          frequencyType,
          gatewayType: "MERCADOPAGO",
        };

        const response = await paymentService.createSubscription(request);

        if (response.success && response.data) {
          if (response.data.subscriptionData?.checkoutUrl) {
            window.location.href = response.data.subscriptionData.checkoutUrl;
          } else {
            onPaymentSuccess(response.data.subscriptionId, "subscription");
          }
        } else {
          toast({
            title: "Erro na assinatura",
            description:
              response.error || "Não foi possível criar a assinatura",
            variant: "destructive",
          });
        }
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header com informações do curso */}
        <div className="mb-8">
          <CourseInfo course={course} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda - Opções de Pagamento */}
          <div className="lg:col-span-2 space-y-6">
            <PaymentTypeConfig
              paymentType={paymentType}
              onPaymentTypeChange={setPaymentType}
              frequency={frequency}
              frequencyType={frequencyType}
              onFrequencyChange={setFrequency}
              onFrequencyTypeChange={setFrequencyType}
            />

            <GatewaySelection />

            {paymentType === "ONE_TIME" && (
              <PaymentMethodSelection
                gateway={PAYMENT_GATEWAYS.MERCADOPAGO}
                selectedMethod={selectedMethod}
                onMethodChange={setSelectedMethod}
                paymentType={paymentType}
              />
            )}

            <CouponManagement
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              isValidatingCoupon={isValidatingCoupon}
              showCouponInput={showCouponInput}
              onShowCouponInput={() => setShowCouponInput(true)}
              onValidateCoupon={validateCoupon}
              onRemoveCoupon={removeCoupon}
              onCancelCoupon={() => setShowCouponInput(false)}
            />
          </div>

          {/* Coluna direita - Resumo do Pedido */}
          <div className="space-y-6">
            {orderSummary && (
              <OrderSummary
                orderSummary={orderSummary}
                paymentType={paymentType}
                frequency={frequency}
                frequencyType={frequencyType}
              />
            )}

            <PaymentActions
              paymentType={paymentType}
              isProcessing={isProcessing}
              onPayment={handlePayment}
              onCancel={onCancel}
            />
          </div>
        </div>
      </div>

      {/* Modal do PIX */}
      {pixPaymentData && (
        <PixPaymentModal
          isOpen={showPixModal}
          onClose={() => {
            setShowPixModal(false);
            setPixPaymentData(null);
          }}
          pixData={pixPaymentData}
          onPaymentConfirmed={() => {
            onPaymentSuccess(pixPaymentData.paymentId, "payment");
          }}
        />
      )}
    </div>
  );
}
