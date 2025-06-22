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
    <div className="space-y-4">
      {!appliedCoupon && !showCouponInput && (
        <Button
          variant="outline"
          onClick={() => setShowCouponInput(true)}
          className="w-full h-12 text-base"
        >
          <Tag className="w-5 h-5 mr-2" />
          Adicionar Cupom de Desconto
        </Button>
      )}

      {!appliedCoupon && showCouponInput && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Digite o código do cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={isValidatingCoupon}
              className="h-12 text-base flex-1"
            />
            <Button
              onClick={onValidateCoupon}
              disabled={isValidatingCoupon || !couponCode.trim()}
              className="h-12 px-6 sm:w-auto w-full"
            >
              {isValidatingCoupon ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Aplicar"
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCouponInput(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
        </div>
      )}

      {appliedCoupon && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-green-800 dark:text-green-200 text-base">
                  Cupom "{couponCode}" aplicado
                </div>
                <div className="text-green-600 dark:text-green-300">
                  Desconto: {formatDiscount(appliedCoupon.discount)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveCoupon}
              className="hover:bg-green-100 dark:hover:bg-green-900/40"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
