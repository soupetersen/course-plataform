import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Gift,
  Search,
  Copy,
  Check,
  Percent,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useStudentCouponApi } from "../../hooks/usePaymentApi";
import { AvailableCoupon } from "../../types/payment";
import { useToast } from "../ui/use-toast";

export const StudentCoupons: React.FC = () => {
  const { user } = useAuth();
  const { getAvailableCoupons } = useStudentCouponApi();
  const { toast } = useToast();
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAvailableCoupons();
      console.log("Response from getAvailableCoupons:", response);

      if (response?.success) {
        setAvailableCoupons(response.data || []);
        console.log("Successfully set coupons:", response.data?.length || 0);
      } else {
        console.warn("Failed to fetch coupons from API:", response);
        setAvailableCoupons([]);
        if (response !== null) {
          const errorMessage = "Falha ao carregar cupons do servidor";
          setError(errorMessage);
          toast({
            title: "Erro de conexão",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (fetchError) {
      console.error("Error fetching available coupons:", fetchError);
      setAvailableCoupons([]);
      const errorMessage =
        "Não foi possível carregar os cupons. Verifique se o backend está rodando.";
      setError(errorMessage);
      toast({
        title: "Erro de conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [getAvailableCoupons, toast]);

  useEffect(() => {
    if (user) {
      fetchAvailableCoupons();
    }
  }, [user, fetchAvailableCoupons]);

  const filteredCoupons = availableCoupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Código copiado!",
        description: `O código "${code}" foi copiado para a área de transferência`,
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatDiscount = (coupon: AvailableCoupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}% OFF`;
    }
    return `R$ ${coupon.discountValue.toFixed(2)} OFF`;
  };

  const formatMinimumAmount = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7;
  };

  const getDaysUntilExpiry = (validUntil: string) => {
    return Math.ceil(
      (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">
            Faça login para ver cupons disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {availableCoupons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Cupons Disponíveis
                  </p>
                  <p className="text-2xl font-bold">
                    {availableCoupons.length}
                  </p>
                </div>
                <Gift className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Maior Desconto
                  </p>
                  <p className="text-2xl font-bold">
                    {Math.max(
                      ...availableCoupons.map((c) =>
                        c.discountType === "PERCENTAGE" ? c.discountValue : 0
                      )
                    )}
                    %
                  </p>
                </div>
                <Percent className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Expirando Hoje
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      availableCoupons.filter(
                        (c) => getDaysUntilExpiry(c.validUntil) <= 1
                      ).length
                    }
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Cupons Disponíveis
              </CardTitle>
              <CardDescription>
                Economize em seus cursos com estes cupons de desconto
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAvailableCoupons}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "Nenhum cupom encontrado"
                    : error
                    ? "Erro ao carregar cupons"
                    : "Nenhum cupom disponível"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Tente buscar por outros termos"
                    : error
                    ? "Verifique se o backend está rodando e tente novamente"
                    : "Novos cupons serão adicionados em breve!"}
                </p>
                {error && (
                  <Button
                    variant="outline"
                    onClick={fetchAvailableCoupons}
                    className="mt-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCoupons.map((coupon) => (
                  <Card
                    key={coupon.id}
                    className="border-l-4 border-l-green-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {coupon.discountType === "PERCENTAGE" ? (
                                <Percent className="h-4 w-4 text-green-600" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-green-600" />
                              )}
                              <span className="font-mono text-lg font-bold">
                                {coupon.code}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {formatDiscount(coupon)}
                            </Badge>
                            {isExpiringSoon(coupon.validUntil) && (
                              <Badge variant="destructive">
                                Expira em{" "}
                                {getDaysUntilExpiry(coupon.validUntil)} dias
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-700 mb-2">
                            {coupon.description}
                          </p>

                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {coupon.minimumAmount && (
                              <span>
                                • Compra mínima:{" "}
                                {formatMinimumAmount(coupon.minimumAmount)}
                              </span>
                            )}
                            {coupon.courseTitle && (
                              <span>• Válido para: {coupon.courseTitle}</span>
                            )}
                            {coupon.maxUsageCount && (
                              <span>
                                • Restam{" "}
                                {coupon.maxUsageCount -
                                  coupon.currentUsageCount}{" "}
                                usos
                              </span>
                            )}
                            <span>
                              • Válido até{" "}
                              {new Date(coupon.validUntil).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(coupon.code)}
                          className="ml-4"
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
