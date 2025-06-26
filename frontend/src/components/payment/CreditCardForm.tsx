import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Lock } from "lucide-react";

export interface CreditCardData {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  installments: number;
  identificationType: string;
  identificationNumber: string;
  saveCard?: boolean;
}

interface CreditCardFormProps {
  onCardDataChange: (cardData: CreditCardData) => void;
  maxInstallments?: number;
  isLoading?: boolean;
  initialData?: CreditCardData;
}

export function CreditCardForm({
  onCardDataChange,
  maxInstallments = 12,
  isLoading = false,
  initialData,
}: CreditCardFormProps) {
  const [cardData, setCardData] = useState<CreditCardData>(
    initialData || {
      cardNumber: "",
      cardHolderName: "",
      expirationMonth: "",
      expirationYear: "",
      securityCode: "",
      installments: 1,
      identificationType: "CPF",
      identificationNumber: "",
      saveCard: false,
    }
  );

  const [errors, setErrors] = useState<Partial<CreditCardData>>({});

  useEffect(() => {
    if (initialData) {
      setCardData(initialData);
    }
  }, [initialData]);

  const updateCardData = (
    field: keyof CreditCardData,
    value: string | number | boolean
  ) => {
    const updatedData = { ...cardData, [field]: value };

    if (field === "saveCard") {
      console.log("💾 SaveCard changed:", value, "Full data:", updatedData);
    }

    setCardData(updatedData);
    onCardDataChange(updatedData);

    if (field === "saveCard") return;

    const isValid = validateField(field, value as string | number);
    if (errors[field] && isValid) {
      setErrors({ ...errors, [field]: undefined });
    } else if (!isValid && value !== "") {
      setErrors({ ...errors, [field]: "Campo inválido" });
    }
  };

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formattedValue.slice(0, 19);
  };

  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    return cleanValue
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14);
  };

  const validateField = (
    field: keyof CreditCardData,
    value: string | number
  ) => {
    switch (field) {
      case "cardNumber": {
        const cleanNumber = value.toString().replace(/\D/g, "");
        return cleanNumber.length >= 13 && cleanNumber.length <= 19;
      }
      case "cardHolderName": {
        return value.toString().trim().length >= 2;
      }
      case "expirationMonth": {
        const month = parseInt(value.toString());
        return month >= 1 && month <= 12;
      }
      case "expirationYear": {
        const year = parseInt(value.toString());
        const currentYear = new Date().getFullYear();
        return year >= currentYear && year <= currentYear + 20;
      }
      case "securityCode": {
        const code = value.toString();
        return code.length >= 3 && code.length <= 4;
      }
      case "identificationNumber": {
        if (cardData.identificationType === "CPF") {
          const cleanCPF = value.toString().replace(/\D/g, "");
          return cleanCPF.length === 11;
        }
        return value.toString().length > 0;
      }
      default:
        return true;
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear + i);
  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          Dados do Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
        <div className="space-y-2">
          <Label htmlFor="cardNumber" className="text-sm font-medium">
            Número do Cartão
          </Label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardData.cardNumber}
            onChange={(e) =>
              updateCardData("cardNumber", formatCardNumber(e.target.value))
            }
            disabled={isLoading}
            className={errors.cardNumber ? "border-red-500" : ""}
            maxLength={19}
          />
          {errors.cardNumber && (
            <p className="text-xs text-red-500">Número do cartão inválido</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardHolderName" className="text-sm font-medium">
            Nome no Cartão
          </Label>
          <Input
            id="cardHolderName"
            type="text"
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            value={cardData.cardHolderName}
            onChange={(e) =>
              updateCardData("cardHolderName", e.target.value.toUpperCase())
            }
            disabled={isLoading}
            className={errors.cardHolderName ? "border-red-500" : ""}
          />
          {errors.cardHolderName && (
            <p className="text-xs text-red-500">Nome é obrigatório</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="expirationMonth" className="text-sm font-medium">
              Mês
            </Label>
            <Select
              value={cardData.expirationMonth}
              onValueChange={(value) =>
                updateCardData("expirationMonth", value)
              }
              disabled={isLoading}
            >
              <SelectTrigger
                className={errors.expirationMonth ? "border-red-500" : ""}
              >
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expirationYear" className="text-sm font-medium">
              Ano
            </Label>
            <Select
              value={cardData.expirationYear}
              onValueChange={(value) => updateCardData("expirationYear", value)}
              disabled={isLoading}
            >
              <SelectTrigger
                className={errors.expirationYear ? "border-red-500" : ""}
              >
                <SelectValue placeholder="AAAA" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="securityCode"
              className="text-sm font-medium flex items-center gap-1"
            >
              CVV
              <Lock className="w-3 h-3 text-gray-400" />
            </Label>
            <Input
              id="securityCode"
              type="text"
              placeholder="123"
              value={cardData.securityCode}
              onChange={(e) =>
                updateCardData(
                  "securityCode",
                  e.target.value.replace(/\D/g, "")
                )
              }
              disabled={isLoading}
              className={errors.securityCode ? "border-red-500" : ""}
              maxLength={4}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="installments" className="text-sm font-medium">
            Parcelas
          </Label>
          <Select
            value={cardData.installments.toString()}
            onValueChange={(value) =>
              updateCardData("installments", parseInt(value))
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(
                (installment) => (
                  <SelectItem key={installment} value={installment.toString()}>
                    {installment}x{" "}
                    {installment === 1
                      ? "à vista"
                      : `de R$ ${(100 / installment).toFixed(2)}`}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Dados Pessoais</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="identificationType"
                className="text-sm font-medium"
              >
                Documento
              </Label>
              <Select
                value={cardData.identificationType}
                onValueChange={(value) => {
                  updateCardData("identificationType", value);
                  updateCardData("identificationNumber", "");
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="CNPJ">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor="identificationNumber"
                className="text-sm font-medium"
              >
                Número do {cardData.identificationType}
              </Label>
              <Input
                id="identificationNumber"
                type="text"
                placeholder={
                  cardData.identificationType === "CPF"
                    ? "000.000.000-00"
                    : "00.000.000/0001-00"
                }
                value={cardData.identificationNumber}
                onChange={(e) => {
                  const value =
                    cardData.identificationType === "CPF"
                      ? formatCPF(e.target.value)
                      : e.target.value.replace(/\D/g, "").slice(0, 14);
                  updateCardData("identificationNumber", value);
                }}
                disabled={isLoading}
                className={errors.identificationNumber ? "border-red-500" : ""}
              />
              {errors.identificationNumber && (
                <p className="text-xs text-red-500">
                  {cardData.identificationType} inválido
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input
            id="saveCard"
            type="checkbox"
            checked={cardData.saveCard || false}
            onChange={(e) => updateCardData("saveCard", e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="saveCard" className="text-sm cursor-pointer flex-1">
            <span className="font-medium text-blue-800">
              Salvar este cartão
            </span>
            <p className="text-xs text-blue-600 mt-1">
              Seus dados estarão seguros e você poderá usar este cartão nas
              próximas compras
            </p>
          </Label>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <Lock className="w-4 h-4" />
          <span>Seus dados estão protegidos com criptografia SSL</span>
        </div>
      </CardContent>
    </Card>
  );
}
