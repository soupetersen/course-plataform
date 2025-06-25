import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Smartphone,
  FileText,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface PaymentFeeOption {
  method: string;
  description: string;
  fee: number;
  feeDetails: string;
  netAmount: number;
  recommended: boolean;
}

interface PaymentMethodBreakdown {
  studentPays: number;
  mercadoPago: {
    fee: number;
    details: {
      percentage: number;
      fixedFee: number;
      total: number;
      method: string;
      description: string;
    };
  };
  platform: {
    fee: number;
    percentage: number;
  };
  instructor: {
    amount: number;
    percentage: number;
  };
  totals: {
    netReceived: number;
    totalFees: number;
  };
}

interface PaymentFeeCalculatorProps {
  coursePrice: number;
  onMethodSelect?: (method: string, breakdown: PaymentMethodBreakdown) => void;
}

export default function PaymentFeeCalculator({
  coursePrice,
  onMethodSelect,
}: PaymentFeeCalculatorProps) {
  const [options, setOptions] = useState<PaymentFeeOption[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("PIX");
  const [breakdown, setBreakdown] = useState<PaymentMethodBreakdown | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const paymentIcons = {
    PIX: Smartphone,
    CREDIT_CARD: CreditCard,
    DEBIT_CARD: CreditCard,
    BOLETO: FileText,
  };

  const paymentColors = {
    PIX: "text-green-600 bg-green-50",
    CREDIT_CARD: "text-blue-600 bg-blue-50",
    DEBIT_CARD: "text-purple-600 bg-purple-50",
    BOLETO: "text-orange-600 bg-orange-50",
  };

  useEffect(() => {
    loadPaymentOptions();
  }, [coursePrice]);

  useEffect(() => {
    if (selectedMethod) {
      loadMethodBreakdown();
    }
  }, [selectedMethod]);

  const loadPaymentOptions = async () => {
    try {
      setLoading(true);

      // TODO: Substituir por chamada real à API
      // const response = await api.get(`/payment/fees/options?amount=${coursePrice}`);

      // Simular resposta da API
      const mockOptions: PaymentFeeOption[] = [
        {
          method: "PIX",
          description: "PIX - Taxa mais baixa",
          fee: coursePrice * 0.0099,
          feeDetails: "0.99%",
          netAmount: coursePrice - coursePrice * 0.0099,
          recommended: true,
        },
        {
          method: "CREDIT_CARD",
          description: "Cartão de Crédito - À vista",
          fee: coursePrice * 0.0299 + 0.39,
          feeDetails: "2.99% + R$ 0,39",
          netAmount: coursePrice - (coursePrice * 0.0299 + 0.39),
          recommended: false,
        },
        {
          method: "DEBIT_CARD",
          description: "Cartão de Débito",
          fee: coursePrice * 0.0199 + 0.39,
          feeDetails: "1.99% + R$ 0,39",
          netAmount: coursePrice - (coursePrice * 0.0199 + 0.39),
          recommended: false,
        },
        {
          method: "BOLETO",
          description: "Boleto Bancário - Taxa fixa",
          fee: 3.49,
          feeDetails: "R$ 3,49",
          netAmount: coursePrice - 3.49,
          recommended: false,
        },
      ];

      setOptions(mockOptions);
    } catch (error) {
      console.error("Erro ao carregar opções de pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMethodBreakdown = async () => {
    try {
      // TODO: Substituir por chamada real à API
      // const response = await api.post('/payment/fees/calculate', {
      //   amount: coursePrice,
      //   paymentMethod: selectedMethod
      // });

      // Simular breakdown
      const selectedOption = options.find(
        (opt) => opt.method === selectedMethod
      );
      if (!selectedOption) return;

      const netAmount = selectedOption.netAmount;
      const platformFee = Math.round(netAmount * 0.1 * 100) / 100; // 10%
      const instructorAmount = netAmount - platformFee;

      const mockBreakdown: PaymentMethodBreakdown = {
        studentPays: coursePrice,
        mercadoPago: {
          fee: selectedOption.fee,
          details: {
            percentage:
              selectedMethod === "PIX"
                ? 0.99
                : selectedMethod === "BOLETO"
                ? 0
                : selectedMethod === "CREDIT_CARD"
                ? 2.99
                : 1.99,
            fixedFee:
              selectedMethod === "PIX"
                ? 0
                : selectedMethod === "BOLETO"
                ? 3.49
                : 0.39,
            total: selectedOption.fee,
            method: selectedMethod,
            description: selectedOption.description,
          },
        },
        platform: {
          fee: platformFee,
          percentage: 10,
        },
        instructor: {
          amount: instructorAmount,
          percentage: Math.round((instructorAmount / coursePrice) * 100),
        },
        totals: {
          netReceived: netAmount,
          totalFees: selectedOption.fee + platformFee,
        },
      };

      setBreakdown(mockBreakdown);
      onMethodSelect?.(selectedMethod, mockBreakdown);
    } catch (error) {
      console.error("Erro ao calcular breakdown:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calculando taxas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {options.map((option) => {
              const Icon =
                paymentIcons[option.method as keyof typeof paymentIcons];
              const isSelected = selectedMethod === option.method;

              return (
                <div
                  key={option.method}
                  className={`
                    relative p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                  onClick={() => setSelectedMethod(option.method)}
                >
                  {option.recommended && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Recomendado
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded ${
                        paymentColors[
                          option.method as keyof typeof paymentColors
                        ]
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">
                        {option.method.replace("_", " ")}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {option.feeDetails}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Taxa:</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(option.fee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Você recebe:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(option.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Detalhado */}
      {breakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Detalhamento - {selectedMethod.replace("_", " ")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Valores */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Aluno Paga</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(breakdown.studentPays)}
                  </p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Taxa {breakdown.mercadoPago.details.method}
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    -{formatCurrency(breakdown.mercadoPago.fee)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {breakdown.mercadoPago.details.percentage}%
                    {breakdown.mercadoPago.details.fixedFee > 0 &&
                      ` + ${formatCurrency(
                        breakdown.mercadoPago.details.fixedFee
                      )}`}
                  </p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Taxa Plataforma</p>
                  <p className="text-xl font-bold text-purple-600">
                    -{formatCurrency(breakdown.platform.fee)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {breakdown.platform.percentage}%
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Instrutor Recebe</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(breakdown.instructor.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {breakdown.instructor.percentage}% do total
                  </p>
                </div>
              </div>

              {/* Recomendação */}
              {selectedMethod !== "PIX" && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Economize{" "}
                    {formatCurrency(
                      breakdown.mercadoPago.fee - coursePrice * 0.0099
                    )}
                    escolhendo PIX em vez de {selectedMethod.replace("_", " ")}
                  </span>
                </div>
              )}

              {selectedMethod === "PIX" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Ótima escolha! PIX tem a menor taxa disponível.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
