import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

// New modular components
import { PaymentSteps } from "./PaymentSteps";
import { CartStep } from "./CartStep";
import { PaymentStep } from "./PaymentStep";
import { CheckoutStep } from "./CheckoutStep";
import { PixPaymentModal } from "./PixPaymentModal";

// Types and services
import { CreditCardData } from "./CreditCardForm";
import { SavedCard } from "@/services/savedCards";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";

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
  paymentType?: "ONE_TIME" | "SUBSCRIPTION";
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentCheckout({
  course,
  paymentType: initialPaymentType = "ONE_TIME",
  onPaymentSuccess,
  onPaymentError,
}: PaymentCheckoutProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState<string>("cart");
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
  const [selectedGateway] = useState<"MERCADOPAGO">("MERCADOPAGO");
  const [paymentType] = useState<"ONE_TIME" | "SUBSCRIPTION">(
    initialPaymentType
  );
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
    expirationDate?: string;
    expirationMinutes?: number;
  } | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);

  // Payment waiting states
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [pendingPayments, setPendingPayments] = useState<Set<string>>(
    new Set()
  );

  // Payment status hook
  const { isPolling, startPolling } = usePaymentStatus(currentPaymentId);

  const { toast } = useToast();

  // Verificar se já existe pagamento pendente para este curso
  const checkPendingPayment = useCallback(async () => {
    try {
      const response = await api.get(
        `/api/payments/course/${course.id}/pending`
      );
      if (response.data.success && response.data.data) {
        const pendingPayment = response.data.data;
        console.log("Pagamento pendente encontrado:", pendingPayment);

        // Adicionar à lista de pagamentos pendentes
        setPendingPayments((prev) => new Set(prev).add(course.id));
        setCurrentPaymentId(pendingPayment.id);

        // Iniciar polling para este pagamento
        startPolling(
          pendingPayment.id,
          (status) => {
            console.log("Callback do polling:", status);
            setPendingPayments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(course.id);
              return newSet;
            });

            if (status.status === "COMPLETED") {
              onPaymentSuccess(status.id);
            } else {
              setCurrentPaymentId(null);
            }
          },
          () => {
            // Callback para quando pagamento não for encontrado
            console.log(
              "Pagamento pendente não encontrado, cancelando operação"
            );
            setPendingPayments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(course.id);
              return newSet;
            });
            setCurrentPaymentId(null);
            toast({
              title: "Pagamento não encontrado",
              description:
                "O pagamento não foi encontrado no sistema. Tente novamente.",
              variant: "destructive",
            });
          }
        );
      }
    } catch (error) {
      console.error("Erro ao verificar pagamento pendente:", error);
    }
  }, [course.id, startPolling, onPaymentSuccess, toast]);

  // Verificar pagamento pendente ao carregar o componente
  useEffect(() => {
    checkPendingPayment();
  }, [checkPendingPayment]);

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

  const handleSavedCardSelected = (card: SavedCard | null, cvv?: string) => {
    setSelectedSavedCard(card);
    setSavedCardCvv(cvv || "");
    setUseNewCard(false);
  };

  const handleNewCardSelected = () => {
    setSelectedSavedCard(null);
    setSavedCardCvv("");
    setUseNewCard(true);
  };

  const processPayment = async () => {
    console.log("🎯 ProcessPayment - Dados atuais:", {
      selectedPaymentMethod,
      useNewCard,
      creditCardData,
      selectedSavedCard,
      savedCardCvv,
    });

    // Verificar se já existe pagamento pendente para este curso
    if (pendingPayments.has(course.id)) {
      toast({
        title: "Pagamento em andamento",
        description:
          "Já existe um pagamento sendo processado para este curso. Aguarde a confirmação.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      console.log("Processing payment with credit card data:", creditCardData);

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
        ...(selectedPaymentMethod === "CREDIT_CARD" && {
          cardData:
            useNewCard && creditCardData
              ? {
                  cardNumber: creditCardData.cardNumber,
                  cardHolderName: creditCardData.cardHolderName,
                  expirationMonth: creditCardData.expirationMonth,
                  expirationYear: creditCardData.expirationYear,
                  securityCode: creditCardData.securityCode,
                  installments: creditCardData.installments,
                  identificationType: creditCardData.identificationType,
                  identificationNumber: creditCardData.identificationNumber,
                  saveCard: creditCardData.saveCard,
                }
              : selectedSavedCard
              ? {
                  savedCardId: selectedSavedCard.id,
                  securityCode: savedCardCvv,
                  installments: 1, // Pode ser configurável
                }
              : undefined,
        }),
      };

      console.log("Payment data being sent:", paymentData);

      const response = await api.post(endpoint, paymentData);

      if (response.data) {
        const responseData = response.data.data || response.data;

        if (selectedPaymentMethod === "PIX" && responseData.paymentData) {
          const paymentData = responseData.paymentData;

          if (paymentData.pixQrCodeText || paymentData.pixQrCodeImage) {
            const pixDataForModal = {
              qrCode: paymentData.pixQrCodeText, // String para "Copia e Cola"
              qrCodeBase64: paymentData.pixQrCodeImage, // Imagem PNG base64
              amount: feeCalculation?.total || course.price,
              currency: "BRL",
              paymentId: responseData.paymentId,
              expirationDate: paymentData.expirationDate, // Data de expiração do backend
              expirationMinutes: paymentData.expirationMinutes, // Minutos configurados
            };

            setPixData(pixDataForModal);
            setShowPixModal(true);

            return;
          } else {
            console.log(
              "PIX data is invalid - no pixQrCodeText or pixQrCodeImage"
            );
          }
        } else {
          console.log("Not PIX or no payment data");
          console.log("Is PIX?", selectedPaymentMethod === "PIX");
          console.log("Has payment data?", !!responseData.paymentData);
        }

        // Para cartão de crédito, iniciar o polling e aguardar confirmação do webhook
        if (selectedPaymentMethod === "CREDIT_CARD" && responseData.paymentId) {
          console.log(
            "Iniciando polling para pagamento:",
            responseData.paymentId
          );

          // Adicionar à lista de pagamentos pendentes
          setPendingPayments((prev) => new Set(prev).add(course.id));
          setCurrentPaymentId(responseData.paymentId);

          // Iniciar polling
          startPolling(
            responseData.paymentId,
            (status) => {
              console.log("Polling finalizado com status:", status);

              // Remover da lista de pendentes
              setPendingPayments((prev) => {
                const newSet = new Set(prev);
                newSet.delete(course.id);
                return newSet;
              });

              setIsProcessingPayment(false);

              if (status.status === "COMPLETED") {
                onPaymentSuccess(status.id);
              } else {
                // Para status de falha, permitir nova tentativa
                setCurrentPaymentId(null);
                onPaymentError(`Pagamento ${status.status.toLowerCase()}`);
              }
            },
            () => {
              // Callback para quando pagamento não for encontrado
              console.log(
                "Pagamento não encontrado durante polling, cancelando operação"
              );
              setPendingPayments((prev) => {
                const newSet = new Set(prev);
                newSet.delete(course.id);
                return newSet;
              });
              setIsProcessingPayment(false);
              setCurrentPaymentId(null);
              toast({
                title: "Pagamento não encontrado",
                description:
                  "O pagamento não foi encontrado no sistema. Tente novamente.",
                variant: "destructive",
              });
            }
          );

          return; // Não chamar onPaymentSuccess imediatamente
        }

        if (responseData.url) {
          console.log("Redirecting to URL:", responseData.url);
          window.location.href = responseData.url;
        } else {
          console.log("Calling onPaymentSuccess");
          onPaymentSuccess(responseData.paymentId);
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
      // Sempre resetar isProcessingPayment
      setIsProcessingPayment(false);
    }
  };

  // Step navigation functions
  const handleStepChange = (stepId: string) => {
    if (completedSteps.includes(stepId) || stepId === currentStep) {
      setCurrentStep(stepId);
    }
  };

  const goToNextStep = () => {
    const stepOrder = ["cart", "payment", "checkout"];
    const currentIndex = stepOrder.indexOf(currentStep);

    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);

      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
    }
  };

  const goToPreviousStep = () => {
    const stepOrder = ["cart", "payment", "checkout"];
    const currentIndex = stepOrder.indexOf(currentStep);

    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      setCurrentStep(previousStep);
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
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Payment Steps Header */}
        <div className="mb-8">
          <PaymentSteps
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepChange={handleStepChange}
          />
        </div>

        {/* Step Content */}
        <div className="max-w-5xl mx-auto">
          {currentStep === "cart" && (
            <div className="animate-in slide-in-from-left-8 fade-in duration-500">
              <CartStep
                course={course}
                formatCurrency={formatCurrency}
                paymentType={paymentType}
                onContinue={goToNextStep}
              />
            </div>
          )}

          {currentStep === "payment" && (
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-700">
              <PaymentStep
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onCreditCardDataChange={setCreditCardData}
                useNewCard={useNewCard}
                onSavedCardSelected={handleSavedCardSelected}
                onNewCardSelected={handleNewCardSelected}
                isProcessingPayment={isProcessingPayment}
                paymentType={paymentType}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                isValidatingCoupon={isValidatingCoupon}
                onValidateCoupon={validateCoupon}
                onRemoveCoupon={removeCoupon}
                formatDiscount={formatDiscount}
                onContinue={goToNextStep}
                onBack={goToPreviousStep}
                creditCardData={creditCardData}
                selectedSavedCard={selectedSavedCard}
                savedCardCvv={savedCardCvv}
              />
            </div>
          )}

          {currentStep === "checkout" && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-600">
              <CheckoutStep
                course={course}
                selectedPaymentMethod={selectedPaymentMethod}
                feeCalculation={feeCalculation}
                appliedCoupon={appliedCoupon}
                formatCurrency={formatCurrency}
                paymentType={paymentType}
                isProcessingPayment={isProcessingPayment || isPolling}
                hasPendingPayment={pendingPayments.has(course.id)}
                isPolling={isPolling}
                onCancelPendingPayment={() => {
                  // Cancelar pagamento pendente
                  setPendingPayments((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(course.id);
                    return newSet;
                  });
                  setCurrentPaymentId(null);
                  setIsProcessingPayment(false);
                  toast({
                    title: "Pagamento cancelado",
                    description:
                      "Você pode tentar realizar o pagamento novamente.",
                  });
                }}
                onProcessPayment={processPayment}
                onBack={goToPreviousStep}
              />
            </div>
          )}
        </div>
      </div>

      {/* PIX Modal */}
      {pixData && (
        <PixPaymentModal
          isOpen={showPixModal}
          onClose={() => setShowPixModal(false)}
          pixData={pixData}
          onPaymentConfirmed={() => {
            setShowPixModal(false);
            onPaymentSuccess(pixData.paymentId);
          }}
        />
      )}
    </div>
  );
}
