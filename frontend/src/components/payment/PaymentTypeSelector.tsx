import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

interface PaymentTypeSelectorProps {
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  onPaymentTypeChange: (value: "ONE_TIME" | "SUBSCRIPTION") => void;
  coursePrice: number;
  formatCurrency: (amount: number) => string;
}

export function PaymentTypeSelector({
  paymentType,
  onPaymentTypeChange,
  coursePrice,
  formatCurrency,
}: PaymentTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de Pagamento
        </label>
        <Select value={paymentType} onValueChange={onPaymentTypeChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecione o tipo de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ONE_TIME">Pagamento Único</SelectItem>
            <SelectItem value="SUBSCRIPTION">Assinatura Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentType === "SUBSCRIPTION" && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-lg">
                Assinatura Mensal
              </div>
              <p className="text-blue-800 dark:text-blue-200 mb-4 leading-relaxed">
                Você será cobrado mensalmente o valor integral do curso e terá
                acesso completo enquanto a assinatura estiver ativa. Cancele a
                qualquer momento.
              </p>
              <div className="flex items-center gap-2 font-semibold text-lg">
                <span className="text-blue-900 dark:text-blue-100">
                  Valor mensal:
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatCurrency(coursePrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
