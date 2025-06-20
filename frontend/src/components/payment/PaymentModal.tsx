import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Card, CardContent } from "../ui/card";
import { CreditCard, Gift, Loader2, X } from "lucide-react";
import { usePaymentApi } from "../../hooks/usePaymentApi";
import type { Course } from "../../types/api";

interface PaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentType?: "ONE_TIME" | "SUBSCRIPTION";
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  course,
  isOpen,
  onClose,
  onSuccess,
  paymentType = "ONE_TIME",
}) => {
  const { validateCoupon, calculateFees } = usePaymentApi();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"details" | "payment">(
    "details"
  );
  const [fees, setFees] = useState<{
    platformFee: number;
    processingFee: number;
  } | null>(null);

  const originalPrice = course.price;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  useEffect(() => {
    if (isOpen) {
      calculateFees({
        originalAmount: originalPrice,
        discountAmount: 0,
      }).then((result) => {
        if (result?.success && result.calculation) {
          setFees({
            platformFee: result.calculation.platformFee,
            processingFee: result.calculation.stripeFee,
          });
        }
      });
    }
  }, [isOpen, originalPrice, calculateFees]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const result = await validateCoupon({
        code: couponCode,
        coursePrice: originalPrice,
      });

      if (result?.success && result.valid) {
        setAppliedCoupon({
          code: couponCode,
          discountAmount: result.discountAmount || 0,
          discountType: result.coupon?.discountType || "FLAT_RATE",
          discountValue: result.coupon?.discountValue || 0,
        });
        setCouponError(null);
      } else {
        setCouponError(result?.error || result?.message || "Cupom inválido");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Erro ao validar cupom");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleProceedToPayment = () => {
    setPaymentStep("payment");
  };

  const handlePaymentSuccess = () => {
    onSuccess();
    onClose();
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError(null);
    setPaymentStep("details");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const platformFee = fees?.platformFee || 0;
  const processingFee = fees?.processingFee || 0;
  const totalWithFees = finalPrice + platformFee + processingFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {paymentStep === "details"
              ? "Detalhes do Pagamento"
              : "Finalizar Pagamento"}
          </DialogTitle>
          <DialogDescription>
            {paymentStep === "details"
              ? "Revise os detalhes do seu pedido e aplique cupons de desconto"
              : "Complete o pagamento para acessar o curso"}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "details" ? (
          <div className="space-y-6">
            {/* Course Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {course.imageUrl && (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{course.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Por {course.instructor?.name}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {paymentType === "ONE_TIME"
                        ? "Pagamento Único"
                        : "Assinatura"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Cupom de Desconto</Label>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Digite o código do cupom"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      className="text-sm"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || isApplyingCoupon}
                    className="px-4"
                  >
                    {isApplyingCoupon ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Aplicar"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Cupom {appliedCoupon.code} aplicado!
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-red-600">{couponError}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Resumo do Pedido</Label>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Preço do curso</span>
                  <span>{formatPrice(originalPrice)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Desconto (
                      {appliedCoupon.discountType === "PERCENTAGE"
                        ? `${appliedCoupon.discountValue}%`
                        : formatPrice(appliedCoupon.discountValue)}
                      )
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(finalPrice)}</span>
                </div>

                {fees && (
                  <>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Taxa da plataforma</span>
                      <span>{formatPrice(platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Taxa de processamento</span>
                      <span>{formatPrice(processingFee)}</span>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(totalWithFees)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleProceedToPayment}
                className="flex-1 bg-[#FF204E] hover:bg-[#A0153E]"
                disabled={totalWithFees <= 0}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-600">
                Integração com Stripe será implementada aqui
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total: {formatPrice(totalWithFees)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPaymentStep("details")}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handlePaymentSuccess}
                className="flex-1 bg-[#FF204E] hover:bg-[#A0153E]"
              >
                Simular Pagamento
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
