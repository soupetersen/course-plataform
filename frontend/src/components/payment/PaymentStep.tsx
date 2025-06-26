import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { PaymentMethodsSection } from "./PaymentMethodsSection";
import { CouponSectionCard } from "./CouponSectionCard";
import { CreditCardData } from "./CreditCardForm";
import { SavedCard } from "@/services/savedCards";

interface CouponValidation {
  isValid: boolean;
  discount: {
    type: "PERCENTAGE" | "FLAT_RATE";
    value: number;
    amount: number;
  };
  message?: string;
}

interface PaymentStepProps {
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onCreditCardDataChange: (data: CreditCardData) => void;
  useNewCard: boolean;
  onSavedCardSelected: (card: SavedCard | null, cvv?: string) => void;
  onNewCardSelected: () => void;
  isProcessingPayment: boolean;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";

  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: CouponValidation | null;
  isValidatingCoupon: boolean;
  onValidateCoupon: () => void;
  onRemoveCoupon: () => void;
  formatDiscount: (discount: CouponValidation["discount"]) => string;

  onContinue: () => void;
  onBack: () => void;

  creditCardData?: CreditCardData | null;
  selectedSavedCard?: SavedCard | null;
  savedCardCvv?: string;
}

export function PaymentStep({
  selectedPaymentMethod,
  onPaymentMethodChange,
  onCreditCardDataChange,
  useNewCard,
  onSavedCardSelected,
  onNewCardSelected,
  isProcessingPayment,
  paymentType,
  couponCode,
  setCouponCode,
  appliedCoupon,
  isValidatingCoupon,
  onValidateCoupon,
  onRemoveCoupon,
  formatDiscount,
  onContinue,
  onBack,
  creditCardData,
  selectedSavedCard,
  savedCardCvv,
}: PaymentStepProps) {
  const canContinue = () => {
    if (!selectedPaymentMethod) return false;

    if (selectedPaymentMethod !== "CREDIT_CARD") {
      return true;
    }

    if (useNewCard) {
      const isValid =
        creditCardData &&
        creditCardData.cardNumber &&
        creditCardData.cardHolderName &&
        creditCardData.expirationMonth &&
        creditCardData.expirationYear &&
        creditCardData.securityCode &&
        creditCardData.identificationType &&
        creditCardData.identificationNumber;

      console.log("🎯 PaymentStep - Novo cartão:", { isValid, creditCardData });
      return isValid;
    } else {
      const isValid =
        selectedSavedCard && savedCardCvv && savedCardCvv.length >= 3;

      console.log("🎯 PaymentStep - Cartão salvo:", {
        isValid,
        selectedSavedCard: selectedSavedCard?.id,
        savedCardCvv: savedCardCvv?.length,
      });
      return isValid;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-400">
        <h2 className="text-2xl font-bold">Método de Pagamento</h2>
        <p className="text-muted-foreground">
          Escolha como deseja pagar e aplique cupons de desconto
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-in slide-in-from-left-6 fade-in duration-600 delay-200">
          <PaymentMethodsSection
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={onPaymentMethodChange}
            onCreditCardDataChange={onCreditCardDataChange}
            useNewCard={useNewCard}
            onSavedCardSelected={onSavedCardSelected}
            onNewCardSelected={onNewCardSelected}
            isProcessingPayment={isProcessingPayment}
            paymentType={paymentType}
            creditCardData={creditCardData}
          />
        </div>

        <div className="space-y-4 animate-in slide-in-from-right-6 fade-in duration-600 delay-400">
          <CouponSectionCard
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            appliedCoupon={appliedCoupon}
            isValidatingCoupon={isValidatingCoupon}
            onValidateCoupon={onValidateCoupon}
            onRemoveCoupon={onRemoveCoupon}
            formatDiscount={formatDiscount}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-600">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessingPayment}
          className="flex-1 hover:scale-[1.02] transition-transform"
        >
          Voltar ao Carrinho
        </Button>
        <Button
          onClick={onContinue}
          disabled={!canContinue() || isProcessingPayment}
          className="flex-1 group hover:scale-[1.02] transition-transform"
        >
          Continuar
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
