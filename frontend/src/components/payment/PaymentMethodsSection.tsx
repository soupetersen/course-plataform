import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Banknote, FileText } from "lucide-react";
import { CreditCardForm, CreditCardData } from "./CreditCardForm";
import { SavedCardSelector } from "./SavedCardSelector";
import { SavedCard } from "@/services/savedCards";

interface PaymentMethodsSectionProps {
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onCreditCardDataChange: (data: CreditCardData) => void;
  useNewCard: boolean;
  onSavedCardSelected: (card: SavedCard | null, cvv?: string) => void;
  onNewCardSelected: () => void;
  isProcessingPayment: boolean;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
}

export function PaymentMethodsSection({
  selectedPaymentMethod,
  onPaymentMethodChange,
  onCreditCardDataChange,
  useNewCard,
  onSavedCardSelected,
  onNewCardSelected,
  isProcessingPayment,
  paymentType,
}: PaymentMethodsSectionProps) {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "PIX":
        return <Zap className="w-4 h-4" />;
      case "CREDIT_CARD":
        return <CreditCard className="w-4 h-4" />;
      case "DEBIT_CARD":
        return <Banknote className="w-4 h-4" />;
      case "BOLETO":
        return <FileText className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getMethodIcon(selectedPaymentMethod)}
          Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedPaymentMethod}
          onValueChange={onPaymentMethodChange}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="PIX" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              PIX
              <Badge variant="secondary" className="ml-1">
                Instantâneo
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="CREDIT_CARD"
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Cartão
              {paymentType === "ONE_TIME" && (
                <Badge variant="secondary" className="ml-1">
                  12x
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="BOLETO" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Boleto
              <Badge variant="secondary" className="ml-1">
                3 dias
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="PIX" className="mt-6">
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 animate-in zoom-in-95 fade-in duration-600 delay-100">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    Pagamento via PIX
                  </h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  • Aprovação instantânea
                  <br />
                  • Disponível 24/7
                  <br />
                  • Sem taxas adicionais
                  <br />• Seguro e prático
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="CREDIT_CARD" className="mt-6">
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <SavedCardSelector
                onCardSelected={onSavedCardSelected}
                onNewCardSelected={onNewCardSelected}
                isLoading={isProcessingPayment}
              />

              {useNewCard && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
                  <CreditCardForm
                    onCardDataChange={onCreditCardDataChange}
                    maxInstallments={paymentType === "ONE_TIME" ? 12 : 1}
                    isLoading={isProcessingPayment}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="BOLETO" className="mt-6">
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 animate-in zoom-in-95 fade-in duration-600 delay-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">
                    Pagamento via Boleto
                  </h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  • Vencimento em 3 dias úteis
                  <br />
                  • Pode ser pago em qualquer banco
                  <br />
                  • Confirmação em até 2 dias úteis
                  <br />• Sem necessidade de cartão
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
