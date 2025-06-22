import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check, Tag, Gift, X } from "lucide-react";

interface CouponAppliedData {
  success: boolean;
  data?: {
    couponId: string;
    discountAmount: number;
    finalAmount: number;
    discountType: string;
    discountValue: number;
  };
}

interface CouponManagementProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: CouponAppliedData | null;
  isValidatingCoupon: boolean;
  showCouponInput: boolean;
  onShowCouponInput: () => void;
  onValidateCoupon: () => void;
  onRemoveCoupon: () => void;
  onCancelCoupon: () => void;
}

export function CouponManagement({
  couponCode,
  setCouponCode,
  appliedCoupon,
  isValidatingCoupon,
  showCouponInput,
  onShowCouponInput,
  onValidateCoupon,
  onRemoveCoupon,
  onCancelCoupon,
}: CouponManagementProps) {
  const formatDiscount = (data: CouponAppliedData["data"]) => {
    if (!data) return "";
    return data.discountType === "PERCENTAGE"
      ? `${data.discountValue}%`
      : `R$ ${data.discountValue.toFixed(2)}`;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Gift className="w-6 h-6 text-green-600" />
          Cupom de Desconto
        </CardTitle>
        <CardDescription className="text-base">
          Tem um cupom? Digite o código para aplicar desconto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!appliedCoupon && !showCouponInput && (
          <Button
            variant="outline"
            onClick={onShowCouponInput}
            className="w-full h-12 text-base"
          >
            <Tag className="w-5 h-5 mr-2" />
            Adicionar Cupom de Desconto
          </Button>
        )}

        {showCouponInput && !appliedCoupon && (
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
              onClick={onCancelCoupon}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        )}

        {appliedCoupon && appliedCoupon.data && (
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
                    Desconto: {formatDiscount(appliedCoupon.data)}
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
      </CardContent>
    </Card>
  );
}
