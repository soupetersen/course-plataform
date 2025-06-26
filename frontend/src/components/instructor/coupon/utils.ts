export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount)
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

