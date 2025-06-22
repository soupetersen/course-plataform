import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Clock,
  Users,
  Star,
  ChevronRight,
  BookOpen,
  Play,
  Award,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  price: number;
  description?: string;
  instructor?: string;
  duration?: string;
  students?: number;
  rating?: number;
  level?: string;
  modules?: number;
  lessons?: number;
}

interface CartStepProps {
  course: Course;
  formatCurrency: (amount: number) => string;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
  onContinue: () => void;
}

export function CartStep({
  course,
  formatCurrency,
  paymentType,
  onContinue,
}: CartStepProps) {
  const isSubscription = paymentType === "SUBSCRIPTION";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Revisar Produto</h2>
        <p className="text-muted-foreground">
          Confirme os detalhes do curso antes de prosseguir
        </p>
      </div>

      {/* Course Details Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Seu Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {course.description}
                  </p>
                )}

                {course.instructor && (
                  <p className="text-sm">
                    <span className="font-medium">Instrutor:</span>{" "}
                    {course.instructor}
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    isSubscription ? course.price / 12 : course.price
                  )}
                </div>
                {isSubscription && (
                  <div className="text-sm text-muted-foreground">/mês</div>
                )}
              </div>
            </div>

            {/* Course Stats */}
            {(course.rating || course.students || course.duration) && (
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {course.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                )}
                {course.students && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} alunos</span>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Course Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {course.modules && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{course.modules} módulos</span>
                </div>
              )}
              {course.lessons && (
                <div className="flex items-center gap-2 text-sm">
                  <Play className="w-4 h-4 text-primary" />
                  <span>{course.lessons} aulas</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-primary" />
                <span>Certificado</span>
              </div>
            </div>

            {/* Level Badge */}
            {course.level && (
              <div className="flex gap-2">
                <Badge variant="secondary">Nível: {course.level}</Badge>
                {isSubscription && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Assinatura Mensal
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Payment Type Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">
              {isSubscription ? "Plano de Assinatura" : "Compra Única"}
            </h4>
            <p className="text-sm text-muted-foreground">
              {isSubscription
                ? "Acesso completo ao curso com cobrança mensal. Cancele a qualquer momento."
                : "Acesso vitalício ao curso com pagamento único."}
            </p>
          </div>

          {/* Continue Button */}
          <Button onClick={onContinue} size="lg" className="w-full">
            Continuar para Pagamento
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <p>🔒 Seus dados estão protegidos com criptografia SSL</p>
      </div>
    </div>
  );
}
