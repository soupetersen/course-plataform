import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAYMENT_GATEWAYS } from "@/services/payment";
import { AxiosError } from "axios";
import { api } from "@/lib/api";

import { PaymentSteps } from "./PaymentSteps";
import { PaymentMethodSelection } from "./PaymentMethodSelection";
import { CreditCardForm, CreditCardData } from "./CreditCardForm";
import { SavedCardSelector } from "./SavedCardSelector";
import { CouponSection } from "./CouponSection";
import { CourseSummary } from "./CourseSummary";
import { PriceBreakdown } from "./PriceBreakdown";
import { PixPaymentModal } from "./PixPaymentModal";
import { SavedCard } from "@/services/savedCards";

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
  const [currentStep, setCurrentStep] = useState("method");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(
    null
  );
  const [feeCalculation, setFeeCalculation] = useState<FeeCalculation | null>(
    null
  );
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("PIX");
  const [creditCardData, setCreditCardData] = useState<CreditCardData | null>(
    null
  );
  const [selectedSavedCard, setSelectedSavedCard] = useState<SavedCard | null>(
    null
  );
  const [savedCardCvv, setSavedCardCvv] = useState<string>("");
  const [useNewCard, setUseNewCard] = useState<boolean>(true);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64?: string;
    amount: number;
    currency: string;
    paymentId: string;
  } | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);

  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

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

  const formatDiscount = (discount: CouponValidation["discount"]) => {
    if (discount.type === "PERCENTAGE") {
      return `${discount.value}%`;
    }
    return `R$ ${discount.value.toFixed(2)}`;
  };

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

    try {
      const paymentData = {
        courseId: course.id,
        amount: feeCalculation?.total || course.price,
        couponCode: appliedCoupon ? couponCode : undefined,
        gateway: "MERCADOPAGO",
        paymentMethod: selectedPaymentMethod,
        currency: "BRL",
        gatewayType: "MERCADOPAGO",
        ...(selectedPaymentMethod === "CREDIT_CARD" && {
          ...(useNewCard && creditCardData
            ? {
                cardData: {
                  cardNumber: creditCardData.cardNumber,
                  cardHolderName: creditCardData.cardHolderName,
                  expirationMonth: creditCardData.expirationMonth,
                  expirationYear: creditCardData.expirationYear,
                  securityCode: creditCardData.securityCode,
                  identificationType: creditCardData.identificationType,
                  identificationNumber: creditCardData.identificationNumber,
                },
                saveCard: creditCardData.saveCard,
              }
            : {
                savedCardId: selectedSavedCard?.id,
                cvv: savedCardCvv,
              }),
        }),
      };

      const response = await api.post("/api/payments/one-time", paymentData);

      if (response.data && response.data.payment) {
        const payment = response.data.payment;

        if (selectedPaymentMethod === "PIX" && payment.paymentData) {
          const pixInfo = JSON.parse(payment.paymentData);
          setPixData({
            qrCode: pixInfo.qr_code,
            qrCodeBase64: pixInfo.qr_code_base64,
            amount: payment.amount,
            currency: payment.currency,
            paymentId: payment.id,
          });
          setShowPixModal(true);
        } else if (selectedPaymentMethod === "CREDIT_CARD") {
          if (payment.status === "APPROVED") {
            onPaymentSuccess(payment.id);
          } else {
            onPaymentError(
              "Pagamento não aprovado. Verifique os dados do cartão."
            );
          }
        }
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      let errorMessage = "Erro ao processar pagamento";

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      onPaymentError(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const handleNextStep = () => {
    const steps = ["method", "details", "coupon", "review"];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }

      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps = ["method", "details", "coupon", "review"];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case "method":
        return selectedPaymentMethod !== "";
      case "details":
        if (selectedPaymentMethod === "PIX") return true;
        if (selectedPaymentMethod === "CREDIT_CARD") {
          return useNewCard
            ? creditCardData !== null
            : selectedSavedCard !== null && savedCardCvv !== "";
        }
        return false;
      case "coupon":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "method":
        return (
          <div className="space-y-6">
            <PaymentMethodSelection
              gateway={PAYMENT_GATEWAYS.MERCADOPAGO}
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
            />
          </div>
        );

      case "details":
        if (selectedPaymentMethod === "PIX") {
          return (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pagamento via PIX</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Você receberá um QR Code para realizar o pagamento via PIX.
                    O pagamento é processado instantaneamente.
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        }

        if (selectedPaymentMethod === "CREDIT_CARD") {
          return (
            <div className="space-y-6">
              <SavedCardSelector
                onCardSelected={(card, cvv) => {
                  setSelectedSavedCard(card);
                  setSavedCardCvv(cvv || "");
                }}
                onNewCardSelected={() => setUseNewCard(true)}
              />

              {useNewCard && (
                <CreditCardForm onCardDataChange={setCreditCardData} />
              )}
            </div>
          );
        }

        return null;

      case "coupon":
        return (
          <div className="space-y-6">
            <CouponSection
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              isValidatingCoupon={isValidatingCoupon}
              onValidateCoupon={validateCoupon}
              onRemoveCoupon={removeCoupon}
              formatDiscount={formatDiscount}
            />
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <CourseSummary course={course} formatCurrency={formatCurrency} />
            {feeCalculation && (
              <PriceBreakdown
                feeCalculation={feeCalculation}
                paymentType="ONE_TIME"
                formatCurrency={formatCurrency}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PaymentSteps
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={handleStepChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === "method" && "Escolha o Método de Pagamento"}
                {currentStep === "details" && "Detalhes do Pagamento"}
                {currentStep === "coupon" && "Cupom de Desconto"}
                {currentStep === "review" && "Revisar Pedido"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === "method"}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {currentStep !== "review" ? (
              <Button
                onClick={handleNextStep}
                disabled={!canProceedToNextStep()}
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={processPayment}
                disabled={isProcessingPayment || !canProceedToNextStep()}
                className="min-w-32"
              >
                {isProcessingPayment ? "Processando..." : "Finalizar Pagamento"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <CourseSummary course={course} formatCurrency={formatCurrency} />
          {feeCalculation && (
            <PriceBreakdown
              feeCalculation={feeCalculation}
              paymentType="ONE_TIME"
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </div>

      {showPixModal && pixData && (
        <PixPaymentModal
          isOpen={showPixModal}
          onClose={() => setShowPixModal(false)}
          pixData={pixData}
          onPaymentConfirmed={() => onPaymentSuccess(pixData.paymentId)}
        />
      )}
    </div>
  );
}
