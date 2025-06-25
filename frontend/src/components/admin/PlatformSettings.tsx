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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Settings, DollarSign, Clock, Wallet } from "lucide-react";
import {
  usePlatformSettings,
  useUpdatePlatformSetting,
  PlatformSetting,
} from "@/hooks/usePlatformSettings";

interface SettingGroup {
  title: string;
  description: string;
  icon: React.ReactNode;
  settings: PlatformSetting[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function PlatformSettings() {
  const { toast } = useToast();
  const [pendingChanges, setPendingChanges] = React.useState<
    Record<string, string>
  >({});

  const { data, isLoading, error } = usePlatformSettings();
  const updateSettingMutation = useUpdatePlatformSetting();

  const settings = React.useMemo(() => data?.data?.settings || [], [data]);
  const isSaving = updateSettingMutation.isPending;

  const debouncedChanges = useDebounce(pendingChanges, 1000);

  const updateSetting = React.useCallback(
    async (key: string, value: string) => {
      try {
        await updateSettingMutation.mutateAsync({ key, value });
        toast({
          title: "Sucesso",
          description: "Configuração atualizada com sucesso",
        });
      } catch (error) {
        console.error("Failed to update setting:", error);
      }
    },
    [updateSettingMutation, toast]
  );

  const getSetting = React.useCallback(
    (key: string): PlatformSetting | undefined => {
      return settings.find((setting) => setting.key === key);
    },
    [settings]
  );

  const getSettingValue = React.useCallback(
    (key: string, defaultValue = ""): string => {
      const setting = getSetting(key);
      return setting ? setting.value : String(defaultValue);
    },
    [getSetting]
  );

  React.useEffect(() => {
    Object.entries(debouncedChanges).forEach(([key, value]) => {
      const currentValue = getSettingValue(key);
      if (value !== currentValue) {
        updateSetting(key, value);
      }
    });
    setPendingChanges({});
  }, [debouncedChanges, getSettingValue, updateSetting]);

  React.useEffect(() => {
    if (updateSettingMutation.isError) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar configuração",
        variant: "destructive",
      });
    }
  }, [updateSettingMutation.isError, toast]);

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const validateNumberInput = (key: string, value: string): string | null => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "Valor deve ser um número válido";
    if (numValue < 0) return "Valor deve ser positivo";

    switch (key) {
      case "PLATFORM_FEE_PERCENTAGE":
        if (numValue > 100) return "Taxa da plataforma deve ser no máximo 100%";
        break;
      case "REFUND_DAYS_LIMIT":
        if (numValue > 365)
          return "Prazo de reembolso deve ser no máximo 365 dias";
        break;
      case "MINIMUM_PAYOUT_AMOUNT":
        if (numValue > 10000)
          return "Valor mínimo de saque deve ser no máximo R$ 10.000";
        break;
    }
    return null;
  };

  const handleNumberChange = (key: string, value: string) => {
    const error = validateNumberInput(key, value);
    if (error) {
      toast({
        title: "Valor inválido",
        description: error,
        variant: "destructive",
      });
      return;
    }
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleBooleanChange = (key: string, checked: boolean) => {
    updateSetting(key, checked.toString());
  };

  const handleStringChange = (key: string, value: string) => {
    if (value.trim().length === 0) {
      toast({
        title: "Valor inválido",
        description: "O valor não pode estar vazio",
        variant: "destructive",
      });
      return;
    }
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const settingGroups: SettingGroup[] = [
    {
      title: "Taxas e Comissões",
      description: "Configure as taxas da plataforma",
      icon: <DollarSign className="w-5 h-5" />,
      settings: settings.filter((s) =>
        ["PLATFORM_FEE_PERCENTAGE"].includes(s.key)
      ),
    },
    {
      title: "Política de Reembolso",
      description: "Defina as regras para solicitações de reembolso",
      icon: <Clock className="w-5 h-5" />,
      settings: settings.filter((s) => ["REFUND_DAYS_LIMIT"].includes(s.key)),
    },
    {
      title: "Pagamentos",
      description: "Configurações relacionadas a pagamentos e saques",
      icon: <Wallet className="w-5 h-5" />,
      settings: settings.filter((s) =>
        ["MINIMUM_PAYOUT_AMOUNT"].includes(s.key)
      ),
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando configurações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <div>
              <CardTitle>Configurações da Plataforma</CardTitle>
              <CardDescription>
                Gerencie as configurações gerais da plataforma
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {settingGroups.map((group, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {group.icon}
              <div>
                <CardTitle className="text-lg">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {group.settings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {getSettingLabel(setting.key)}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {setting.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {setting.type}
                  </Badge>
                </div>

                {setting.type === "NUMBER" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={setting.value}
                      onChange={(e) =>
                        handleNumberChange(setting.key, e.target.value)
                      }
                      disabled={isSaving}
                      className="max-w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      {getSettingUnit(setting.key)}
                    </span>
                  </div>
                )}

                {setting.type === "BOOLEAN" && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={setting.value === "true"}
                      onCheckedChange={(checked) =>
                        handleBooleanChange(setting.key, checked)
                      }
                      disabled={isSaving}
                    />
                    <span className="text-sm text-muted-foreground">
                      {setting.value === "true" ? "Ativado" : "Desativado"}
                    </span>
                  </div>
                )}

                {setting.type === "STRING" && (
                  <Input
                    value={setting.value}
                    onChange={(e) =>
                      handleStringChange(setting.key, e.target.value)
                    }
                    disabled={isSaving}
                  />
                )}

                <div className="text-xs text-muted-foreground">
                  Última atualização:{" "}
                  {new Date(setting.updatedAt).toLocaleString("pt-BR")}
                </div>
              </div>
            ))}

            {group.settings.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma configuração encontrada nesta categoria
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo das Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Taxa da Plataforma</Label>
              <div className="text-2xl font-bold text-green-600">
                {getSettingValue("PLATFORM_FEE_PERCENTAGE", "10")}%
              </div>
              <p className="text-xs text-muted-foreground">
                Porcentagem cobrada sobre cada venda
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Prazo para Reembolso
              </Label>
              <div className="text-2xl font-bold text-blue-600">
                {getSettingValue("REFUND_DAYS_LIMIT", "7")} dias
              </div>
              <p className="text-xs text-muted-foreground">
                Período limite para solicitação de reembolso
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Saque Mínimo</Label>
              <div className="text-2xl font-bold text-purple-600">
                R${" "}
                {parseFloat(
                  getSettingValue("MINIMUM_PAYOUT_AMOUNT", "50")
                ).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor mínimo para solicitação de saque
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-orange-600" />
              <Label className="text-sm font-medium text-orange-800">
                Taxa do Gateway (Mercado Pago)
              </Label>
            </div>
            <div className="text-lg font-bold text-orange-600 mb-1">
              3.99% + R$ 0,40
            </div>
            <p className="text-xs text-orange-700">
              Taxa fixa do Mercado Pago aplicada automaticamente em todas as
              transações (não configurável)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getSettingLabel(key: string): string {
  const labels: Record<string, string> = {
    PLATFORM_FEE_PERCENTAGE: "Taxa da Plataforma (%)",
    REFUND_DAYS_LIMIT: "Prazo para Reembolso (dias)",
    MINIMUM_PAYOUT_AMOUNT: "Valor Mínimo para Saque (R$)",
    BALANCE_HOLD_DAYS: "Dias de Retenção do Saldo",
  };
  return labels[key] || key;
}

function getSettingUnit(key: string): string {
  const units: Record<string, string> = {
    PLATFORM_FEE_PERCENTAGE: "%",
    REFUND_DAYS_LIMIT: "dias",
    MINIMUM_PAYOUT_AMOUNT: "R$",
    BALANCE_HOLD_DAYS: "dias",
  };
  return units[key] || "";
}
