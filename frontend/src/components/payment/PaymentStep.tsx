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

  // Coupon props
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: CouponValidation | null;
  isValidatingCoupon: boolean;
  onValidateCoupon: () => void;
  onRemoveCoupon: () => void;
  formatDiscount: (discount: CouponValidation["discount"]) => string;

  onContinue: () => void;
  onBack: () => void;
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
}: PaymentStepProps) {
  const canContinue =
    selectedPaymentMethod &&
    (selectedPaymentMethod !== "CREDIT_CARD" || useNewCard);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Método de Pagamento</h2>
        <p className="text-muted-foreground">
          Escolha como deseja pagar e aplique cupons de desconto
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods - Takes 2 columns */}
        <div className="lg:col-span-2">
          <PaymentMethodsSection
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={onPaymentMethodChange}
            onCreditCardDataChange={onCreditCardDataChange}
            useNewCard={useNewCard}
            onSavedCardSelected={onSavedCardSelected}
            onNewCardSelected={onNewCardSelected}
            isProcessingPayment={isProcessingPayment}
            paymentType={paymentType}
          />
        </div>

        {/* Coupon Section - Takes 1 column (sidebar) */}
        <div className="space-y-4">
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

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessingPayment}
          className="flex-1"
        >
          Voltar ao Carrinho
        </Button>
        <Button
          onClick={onContinue}
          disabled={!canContinue || isProcessingPayment}
          className="flex-1"
        >
          Continuar
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
