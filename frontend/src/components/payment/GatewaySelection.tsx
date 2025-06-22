import React from "react";
import { ShieldCheck } from "lucide-react";

export function GatewaySelection() {
  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-green-600" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          Pagamento Seguro via Mercado Pago
        </p>
      </div>
      <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-7">
        Aceita PIX, cartões de crédito/débito
      </p>
    </div>
  );
}
