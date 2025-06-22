import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Banknote, FileText } from "lucide-react";
import { type PaymentGateway } from "@/services/payment";

interface PaymentMethodSelectionProps {
  gateway: PaymentGateway;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  paymentType?: "ONE_TIME" | "SUBSCRIPTION";
}

export function PaymentMethodSelection({
  gateway,
  selectedMethod,
  onMethodChange,
  paymentType = "ONE_TIME",
}: PaymentMethodSelectionProps) {
  const getMethodIcon = (methodType: string) => {
    switch (methodType) {
      case "PIX":
        return <Zap className="h-5 w-5 text-green-600" />;
      case "CREDIT_CARD":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "DEBIT_CARD":
        return <Banknote className="h-5 w-5 text-purple-600" />;
      case "BOLETO":
        return <FileText className="h-5 w-5 text-orange-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMethodBadge = (methodType: string) => {
    switch (methodType) {
      case "PIX":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Instantâneo
          </Badge>
        );
      case "CREDIT_CARD":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Parcelado
          </Badge>
        );
      case "DEBIT_CARD":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            À vista
          </Badge>
        );
      case "BOLETO":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            De 1 à 3 dias úteis
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAvailableMethods = () => {
    if (paymentType === "SUBSCRIPTION") {
      // Para recorrência, apenas cartão de crédito é suportado
      return gateway.supportedMethods.filter(
        (method) => method.type === "CREDIT_CARD"
      );
    }
    // Para pagamento único, todos os métodos são suportados
    return gateway.supportedMethods;
  };

  const availableMethods = getAvailableMethods();

  // Se não há métodos disponíveis para o tipo de pagamento, exibir mensagem
  if (availableMethods.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Método de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-center text-gray-500 py-4 text-sm sm:text-base">
            Nenhum método de pagamento disponível para{" "}
            {paymentType === "SUBSCRIPTION" ? "assinaturas" : "pagamento único"}
            .
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">
          Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <RadioGroup
          value={selectedMethod}
          onValueChange={onMethodChange}
          className="space-y-2 sm:space-y-3"
        >
          {availableMethods.map((method) => (
            <div
              key={method.id}
              className={`relative flex items-center space-x-3 p-3 sm:p-4 border-2 rounded-lg transition-all cursor-pointer hover:border-primary/50 ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="mt-0.5 flex-shrink-0"
              />
              <Label
                htmlFor={method.id}
                className="flex items-center justify-between w-full cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {getMethodIcon(method.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{method.name}</div>
                    {method.type === "PIX" && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Aprovação instantânea
                      </div>
                    )}
                    {method.type === "CREDIT_CARD" && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {paymentType === "SUBSCRIPTION"
                          ? "Para assinaturas mensais"
                          : "Parcele em até 2x sem juros"}
                      </div>
                    )}
                    {method.type === "DEBIT_CARD" && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Débito à vista
                      </div>
                    )}
                    {method.type === "BOLETO" && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Compensação em 1 a 3 dias úteis
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getMethodBadge(method.type)}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export type { PaymentGateway };
