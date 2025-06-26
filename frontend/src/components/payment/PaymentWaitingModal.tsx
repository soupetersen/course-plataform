import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentWaitingModalProps {
  isOpen: boolean;
  paymentStatus:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED"
    | null;
  paymentId: string | null;
  onClose?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

export function PaymentWaitingModal({
  isOpen,
  paymentStatus,
  paymentId,
  onClose,
  onSuccess,
  onError,
}: PaymentWaitingModalProps) {
  const renderContent = () => {
    switch (paymentStatus) {
      case "PENDING":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                <Clock className="h-8 w-8 text-blue-600 absolute top-4 left-4" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Processando seu pagamento...
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Aguarde enquanto confirmamos seu pagamento. Este processo pode
                levar alguns instantes.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>ID do Pagamento:</strong> {paymentId}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Não feche esta página até a confirmação.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        );

      case "COMPLETED":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Pagamento confirmado!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Seu pagamento foi processado com sucesso. Você já pode acessar o
                curso.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Status:</strong> Pagamento aprovado
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>ID:</strong> {paymentId}
                </p>
              </div>
            </div>
            <Button onClick={onSuccess} className="w-full">
              Acessar Curso
            </Button>
          </div>
        );

      case "FAILED":
      case "CANCELLED":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Pagamento não aprovado
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {paymentStatus === "FAILED"
                  ? "O pagamento foi recusado. Verifique os dados do cartão ou tente outro método."
                  : "O pagamento foi cancelado."}
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Status:</strong>{" "}
                  {paymentStatus === "FAILED" ? "Recusado" : "Cancelado"}
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>ID:</strong> {paymentId}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Voltar
              </Button>
              <Button onClick={onError} className="flex-1">
                Tentar Novamente
              </Button>
            </div>
          </div>
        );

      case "REFUNDED":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Pagamento reembolsado
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Este pagamento foi reembolsado.
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Status:</strong> Reembolsado
                </p>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>ID:</strong> {paymentId}
                </p>
              </div>
            </div>
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Verificando pagamento...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Aguarde enquanto verificamos o status do seu pagamento.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <div className="p-6">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}

