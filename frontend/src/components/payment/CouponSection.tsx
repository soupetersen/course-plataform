import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Tag, Check, X } from "lucide-react";

interface CouponValidation {
  isValid: boolean;
  discount: {
    type: "PERCENTAGE" | "FLAT_RATE";
    value: number;
    amount: number;
  };
  message?: string;
}

interface CouponSectionProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: CouponValidation | null;
  isValidatingCoupon: boolean;
  onValidateCoupon: () => void;
  onRemoveCoupon: () => void;
  formatDiscount: (discount: CouponValidation["discount"]) => string;
}

export function CouponSection({
  couponCode,
  setCouponCode,
  appliedCoupon,
  isValidatingCoupon,
  onValidateCoupon,
  onRemoveCoupon,
  formatDiscount,
}: CouponSectionProps) {
  const [showCouponInput, setShowCouponInput] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-4">
      {!appliedCoupon && !showCouponInput && (
        <Button
          variant="outline"
          onClick={() => setShowCouponInput(true)}
          className="w-full h-10 sm:h-12 text-xs sm:text-sm lg:text-base px-2 sm:px-4"
        >
          <Tag className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="break-words text-center leading-tight">
            <span className="hidden sm:inline">
              Adicionar Cupom de Desconto
            </span>
            <span className="sm:hidden">Cupom</span>
          </span>
        </Button>
      )}

      {!appliedCoupon && showCouponInput && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Input
              placeholder="Digite o código do cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={isValidatingCoupon}
              className="h-10 sm:h-12 text-sm sm:text-base flex-1"
            />
            <Button
              onClick={onValidateCoupon}
              disabled={isValidatingCoupon || !couponCode.trim()}
              className="h-10 sm:h-12 px-4 sm:px-6 sm:w-auto w-full text-sm sm:text-base"
            >
              {isValidatingCoupon ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                "Aplicar"
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCouponInput(false)}
            className="w-full sm:w-auto text-sm"
          >
            Cancelar
          </Button>
        </div>
      )}

      {appliedCoupon && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/40 rounded-lg flex-shrink-0">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-green-800 dark:text-green-200 text-sm sm:text-base truncate">
                  Cupom "{couponCode}" aplicado
                </div>
                <div className="text-green-600 dark:text-green-300 text-xs sm:text-sm">
                  Desconto: {formatDiscount(appliedCoupon.discount)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveCoupon}
              className="hover:bg-green-100 dark:hover:bg-green-900/40 flex-shrink-0 p-1 sm:p-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
