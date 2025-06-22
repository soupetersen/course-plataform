import React from "react";
import { useParams } from "react-router-dom";
import { PaymentCheckout } from "@/components/payment/PaymentCheckout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourse } from "@/hooks/useCourses";

export function CheckoutPage() {
  const { courseId } = useParams();
  const { toast } = useToast();
  const { data: courseData, isLoading } = useCourse(courseId!);

  const handlePaymentSuccess = (paymentId: string) => {
    toast({
      title: "Pagamento realizado!",
      description:
        "Seu pagamento foi processado com sucesso. Você já pode acessar o curso.",
    });

    console.log("Payment successful:", paymentId);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Erro no pagamento",
      description: error,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!courseData?.data) {
    return (
      <div className="container mx-auto py-6 max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Curso não encontrado
        </h1>
        <p className="text-gray-600">
          O curso que você está tentando comprar não existe.
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para cursos
        </Link>
      </div>
    );
  }

  const course = courseData.data;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o curso
        </Link>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">
            Complete seu pagamento para ter acesso imediato ao curso
          </p>
        </div>

        <PaymentCheckout
          course={course}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium">Acesso Imediato</div>
                  <div className="text-muted-foreground">
                    Comece agora mesmo
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium">7 Dias para Reembolso</div>
                  <div className="text-muted-foreground">Garantia total</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium">Pagamento Seguro</div>
                  <div className="text-muted-foreground">Múltiplos métodos</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
