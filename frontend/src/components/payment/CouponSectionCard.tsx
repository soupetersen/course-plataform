import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, Tag, Check, X, Loader2 } from "lucide-react";

interface CouponValidation {
  isValid: boolean;
  discount: {
    type: "PERCENTAGE" | "FLAT_RATE";
    value: number;
    amount: number;
  };
  message?: string;
}

interface CouponSectionCardProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: CouponValidation | null;
  isValidatingCoupon: boolean;
  onValidateCoupon: () => void;
  onRemoveCoupon: () => void;
  formatDiscount: (discount: CouponValidation["discount"]) => string;
}

export function CouponSectionCard({
  couponCode,
  setCouponCode,
  appliedCoupon,
  isValidatingCoupon,
  onValidateCoupon,
  onRemoveCoupon,
  formatDiscount,
}: CouponSectionCardProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidateCoupon();
  };

  return (
    <Card className="shadow-sm animate-in zoom-in-95 fade-in duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-green-600 animate-in zoom-in fade-in duration-300 delay-100" />
          Cupom de Desconto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!appliedCoupon ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200"
          >
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Código do cupom</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  type="text"
                  placeholder="Digite o código do cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={isValidatingCoupon}
                  className="flex-1 focus:scale-[1.02] transition-transform"
                />
                <Button
                  type="submit"
                  disabled={!couponCode.trim() || isValidatingCoupon}
                  size="default"
                  className="min-w-24 hover:scale-105 transition-transform"
                >
                  {isValidatingCoupon ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Aplicar"
                  )}
                </Button>
              </div>
            </div>

            <Alert className="animate-in fade-in duration-500 delay-400">
              <Tag className="w-4 h-4" />
              <AlertDescription>
                Insira seu código de cupom para obter desconto na compra.
              </AlertDescription>
            </Alert>
          </form>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-600">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 animate-in zoom-in-95 fade-in duration-500 delay-100">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <div className="flex items-center justify-between">
                  <span>Cupom aplicado com sucesso!</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 animate-in slide-in-from-right-2 fade-in duration-400 delay-200"
                  >
                    {formatDiscount(appliedCoupon.discount)}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">
                  Código: {couponCode}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveCoupon}
                className="text-muted-foreground hover:text-destructive hover:scale-105 transition-all animate-in slide-in-from-right-4 fade-in duration-500 delay-300"
              >
                <X className="w-4 h-4 hover:rotate-90 transition-transform" />
                Remover
              </Button>
            </div>

            <div className="text-sm text-muted-foreground animate-in fade-in duration-500 delay-400">
              Economia: {formatDiscount(appliedCoupon.discount)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

