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
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            Nenhum método de pagamento disponível para{" "}
            {paymentType === "SUBSCRIPTION" ? "assinaturas" : "pagamento único"}.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Método de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod}
          onValueChange={onMethodChange}
          className="space-y-3"
        >
          {availableMethods.map((method) => (
            <div
              key={method.id}
              className={`relative flex items-center space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer hover:border-primary/50 ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="mt-0.5"
              />
              <Label
                htmlFor={method.id}
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {getMethodIcon(method.type)}
                  <div>
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
                {getMethodBadge(method.type)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export type { PaymentGateway };
