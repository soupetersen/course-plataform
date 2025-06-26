import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePaymentApi, paymentUtils } from "@/hooks/usePaymentApi";
import { ShoppingCart, Tag, DollarSign, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  price: number;
  description?: string;
}

interface EnhancedPurchaseButtonProps {
  course: Course;
  className?: string;
  showPricing?: boolean;
  onPurchaseSuccess?: (paymentId: string) => void;
}

export function EnhancedPurchaseButton({
  course,
  className = "",
  showPricing = true,
  onPurchaseSuccess,
}: EnhancedPurchaseButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createPayment } = usePaymentApi();
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      const result = await createPayment({
        courseId: course.id,
        amount: course.price,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      });

      if (result?.success) {
        if (result.url) {
          window.location.href = result.url;
        } else if (result.paymentId) {
          toast({
            title: "Compra realizada!",
            description: "Seu pagamento foi processado com sucesso.",
          });
          onPurchaseSuccess?.(result.paymentId);
        }
      } else {
        toast({
          title: "Erro no pagamento",
          description:
            result?.error || "Não foi possível processar o pagamento",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateToCheckout = () => {
    window.location.href = `/checkout/${course.id}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showPricing && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {paymentUtils.formatCurrency(course.price)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Aceita cupons de desconto
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                • Acesso vitalício ao curso
                <br />
                • 7 dias de garantia para reembolso
                <br />• Suporte direto com o instrutor
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {/* Main purchase button - goes to checkout with coupon support */}
        <Button
          onClick={navigateToCheckout}
          className="w-full"
          size="lg"
          disabled={isProcessing}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Comprar Agora - {paymentUtils.formatCurrency(course.price)}
        </Button>

        {/* Quick purchase button - direct payment without coupons */}
        <Button
          onClick={handlePurchase}
          variant="outline"
          className="w-full"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Compra Rápida
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-center text-muted-foreground">
        Pagamento seguro processado pelo Stripe
      </div>
    </div>
  );
}
