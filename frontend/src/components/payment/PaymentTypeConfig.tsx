import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Repeat, Clock } from "lucide-react";

interface PaymentTypeConfigProps {
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  onPaymentTypeChange: (type: "ONE_TIME" | "SUBSCRIPTION") => void;
  frequency: number;
  frequencyType: "months" | "weeks" | "days" | "years";
  onFrequencyChange: (frequency: number) => void;
  onFrequencyTypeChange: (type: "months" | "weeks" | "days" | "years") => void;
}

export function PaymentTypeConfig({
  paymentType,
  onPaymentTypeChange,
  frequency,
  frequencyType,
  onFrequencyChange,
  onFrequencyTypeChange,
}: PaymentTypeConfigProps) {
  const getFrequencyText = () => {
    const typeMap = {
      days: "dia(s)",
      weeks: "semana(s)",
      months: "mês(es)",
      years: "ano(s)",
    };
    return `${frequency} ${typeMap[frequencyType]}`;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="w-6 h-6" />
          Tipo de Pagamento
        </CardTitle>
        <CardDescription className="text-base">
          Escolha como deseja pagar pelo curso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={paymentType}
          onValueChange={(value) =>
            onPaymentTypeChange(value as "ONE_TIME" | "SUBSCRIPTION")
          }
          className="grid grid-cols-1 gap-4"
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RadioGroupItem value="ONE_TIME" id="one-time" />
            <div className="flex-1">
              <Label
                htmlFor="one-time"
                className="flex items-center gap-2 font-medium cursor-pointer"
              >
                <CreditCard className="h-5 w-5 text-blue-600" />
                Pagamento Único
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Acesso vitalício ao curso com pagamento único
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RadioGroupItem value="SUBSCRIPTION" id="subscription" />
            <div className="flex-1">
              <Label
                htmlFor="subscription"
                className="flex items-center gap-2 font-medium cursor-pointer"
              >
                <Repeat className="h-5 w-5 text-green-600" />
                Assinatura Recorrente
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Pagamento recorrente com flexibilidade de cancelamento
              </p>
            </div>
          </div>
        </RadioGroup>

        {/* Configuração de Frequência para Assinatura */}
        {paymentType === "SUBSCRIPTION" && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency" className="text-sm font-medium">
                  Frequência
                </Label>
                <Input
                  id="frequency"
                  type="number"
                  min="1"
                  max="12"
                  value={frequency}
                  onChange={(e) =>
                    onFrequencyChange(parseInt(e.target.value) || 1)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="frequency-type" className="text-sm font-medium">
                  Período
                </Label>
                <Select
                  value={frequencyType}
                  onValueChange={(value) =>
                    onFrequencyTypeChange(
                      value as "months" | "weeks" | "days" | "years"
                    )
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Dias</SelectItem>
                    <SelectItem value="weeks">Semanas</SelectItem>
                    <SelectItem value="months">Meses</SelectItem>
                    <SelectItem value="years">Anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Cobrança a cada {getFrequencyText()}
                </p>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                Você pode cancelar a qualquer momento
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
