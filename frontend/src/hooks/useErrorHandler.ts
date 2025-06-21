import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";

interface ErrorOptions {
  title?: string;
  description?: string;
  duration?: number;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
  code?: string;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: Error | ApiError | string | unknown, options?: ErrorOptions) => {
      console.error("Error occurred:", error);

      // Extrair mensagem de erro
      let errorMessage = "Ocorreu um erro inesperado";
      let errorTitle = options?.title || "Erro";

      // Type guards para diferentes tipos de erro
      const apiError = error as ApiError;
      const standardError = error as Error;

      if (apiError?.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (standardError?.message) {
        errorMessage = standardError.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Personalizar mensagens para códigos de erro específicos
      if (apiError?.response?.status) {
        switch (apiError.response.status) {
          case 400:
            errorTitle = "Dados inválidos";
            break;
          case 401:
            errorTitle = "Não autorizado";
            errorMessage = "Credenciais inválidas ou sessão expirada";
            break;
          case 403:
            errorTitle = "Acesso negado";
            errorMessage = "Você não tem permissão para realizar esta ação";
            break;
          case 404:
            errorTitle = "Não encontrado";
            errorMessage = "O recurso solicitado não foi encontrado";
            break;
          case 409:
            errorTitle = "Conflito";
            break;
          case 422:
            errorTitle = "Dados inválidos";
            break;
          case 429:
            errorTitle = "Muitas tentativas";
            errorMessage = "Aguarde um momento antes de tentar novamente";
            break;
          case 500:
            errorTitle = "Erro do servidor";
            errorMessage = "Erro interno do servidor. Tente novamente mais tarde";
            break;
          case 502:
          case 503:
          case 504:
            errorTitle = "Serviço indisponível";
            errorMessage = "O serviço está temporariamente indisponível";
            break;
          default:
            errorTitle = "Erro de conexão";
        }
      }

      // Verificar se é erro de rede
      if (apiError?.code === "NETWORK_ERROR" || standardError?.message?.includes("Network Error")) {
        errorTitle = "Erro de conexão";
        errorMessage = "Verifique sua conexão com a internet e tente novamente";
      }

      toast({
        title: errorTitle,
        description: options?.description || errorMessage,
        variant: "destructive",
        duration: options?.duration || 5000,
      });
    },
    [toast]
  );

  const handleSuccess = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || "Sucesso",
        description: message,
        variant: "default",
        duration: 3000,
      });
    },
    [toast]
  );

  const handleWarning = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || "Atenção",
        description: message,
        variant: "default",
        duration: 4000,
      });
    },
    [toast]
  );

  const handleInfo = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || "Informação",
        description: message,
        variant: "default",
        duration: 3000,
      });
    },
    [toast]
  );

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}
