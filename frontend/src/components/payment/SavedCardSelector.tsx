import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Plus, Trash2, Lock } from "lucide-react";
import { SavedCard, savedCardsService } from "@/services/savedCards";

interface SavedCardSelectorProps {
  onCardSelected: (card: SavedCard | null, cvv?: string) => void;
  onNewCardSelected: () => void;
  isLoading?: boolean;
}

export function SavedCardSelector({
  onCardSelected,
  onNewCardSelected,
  isLoading = false,
}: SavedCardSelectorProps) {
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("new");
  const [cvv, setCvv] = useState("");
  const [loadingCards, setLoadingCards] = useState(true);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadSavedCards = useCallback(async () => {
    try {
      setLoadingCards(true);
      const cards = await savedCardsService.getUserSavedCards();
      setSavedCards(cards);

      // Se houver um cartão padrão, selecione-o
      const defaultCard = cards.find((card) => card.isDefault);
      if (defaultCard) {
        setSelectedCardId(defaultCard.id);
      } else if (cards.length > 0) {
        setSelectedCardId(cards[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar cartões salvos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus cartões salvos",
        variant: "destructive",
      });
    } finally {
      setLoadingCards(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSavedCards();
  }, [loadSavedCards]);

  useEffect(() => {
    if (selectedCardId === "new") {
      onNewCardSelected();
    } else {
      const selectedCard = savedCards.find(
        (card) => card.id === selectedCardId
      );
      if (selectedCard) {
        onCardSelected(selectedCard, cvv);
      }
    }
  }, [selectedCardId, cvv, savedCards, onCardSelected, onNewCardSelected]);

  const handleDeleteCard = async (cardId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm("Tem certeza que deseja excluir este cartão?")) {
      return;
    }

    try {
      setDeletingCardId(cardId);
      await savedCardsService.deleteSavedCard(cardId);

      setSavedCards((prev) => prev.filter((card) => card.id !== cardId));

      // Se o cartão deletado estava selecionado, selecionar outro
      if (selectedCardId === cardId) {
        const remainingCards = savedCards.filter((card) => card.id !== cardId);
        if (remainingCards.length > 0) {
          setSelectedCardId(remainingCards[0].id);
        } else {
          setSelectedCardId("new");
        }
      }

      toast({
        title: "Cartão removido",
        description: "O cartão foi removido com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar cartão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o cartão",
        variant: "destructive",
      });
    } finally {
      setDeletingCardId(null);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    switch (brandLower) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "amex":
        return "💳";
      default:
        return "💳";
    }
  };

  const formatCardBrand = (brand: string) => {
    const brandLower = brand.toLowerCase();
    switch (brandLower) {
      case "visa":
        return "Visa";
      case "mastercard":
        return "Mastercard";
      case "amex":
        return "American Express";
      default:
        return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  };

  if (loadingCards) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Cartões Salvos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando cartões...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Selecionar Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedCardId} onValueChange={setSelectedCardId}>
          {/* Opção para novo cartão */}
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="new" id="new" disabled={isLoading} />
            <Label
              htmlFor="new"
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Usar novo cartão</span>
            </Label>
          </div>

          {/* Cartões salvos */}
          {savedCards.map((card) => (
            <div
              key={card.id}
              className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <RadioGroupItem
                value={card.id}
                id={card.id}
                disabled={isLoading}
              />
              <Label
                htmlFor={card.id}
                className="flex items-center justify-between cursor-pointer flex-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCardBrandIcon(card.cardBrand)}
                  </span>
                  <div>
                    <p className="font-medium">
                      {formatCardBrand(card.cardBrand)} ••••{" "}
                      {card.cardNumberLast4}
                    </p>
                    <p className="text-xs text-gray-500">
                      {card.cardHolderName} -{" "}
                      {savedCardsService.formatExpirationDate(
                        card.expirationMonth,
                        card.expirationYear
                      )}
                      {card.isDefault && (
                        <span className="ml-2 text-blue-600 font-medium">
                          (Padrão)
                        </span>
                      )}
                      {savedCardsService.isCardExpired(
                        card.expirationMonth,
                        card.expirationYear
                      ) && (
                        <span className="ml-2 text-red-600 font-medium">
                          (Expirado)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteCard(card.id, e)}
                disabled={deletingCardId === card.id || isLoading}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {deletingCardId === card.id ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                ) : (
                  <Trash2 className="w-4 h-4 text-red-600" />
                )}
              </Button>
            </div>
          ))}
        </RadioGroup>

        {/* Campo CVV para cartão salvo */}
        {selectedCardId !== "new" && (
          <div className="space-y-2 pt-2 border-t">
            <Label
              htmlFor="saved-card-cvv"
              className="text-sm font-medium flex items-center gap-1"
            >
              CVV do cartão selecionado
              <Lock className="w-3 h-3 text-gray-400" />
            </Label>
            <Input
              id="saved-card-cvv"
              type="text"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
              disabled={isLoading}
              maxLength={4}
              className="max-w-24"
            />
            <p className="text-xs text-gray-500">
              Digite o CVV para confirmar o uso do cartão
            </p>
          </div>
        )}

        {savedCards.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum cartão salvo</p>
            <p className="text-xs">
              Adicione um cartão para pagamentos mais rápidos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
