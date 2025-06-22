import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BookOpen, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  price: number;
  description?: string;
  paymentType: "ONE_TIME" | "SUBSCRIPTION";
}

interface CourseInfoProps {
  course: Course;
  onBack?: () => void;
}

export function CourseInfo({ course, onBack }: CourseInfoProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o curso
            </Button>
          )}
        </div>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Finalizar Compra
        </CardTitle>
        <CardDescription className="text-base">
          Complete seu pagamento para ter acesso imediato ao curso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{course.title}</h3>
            {course.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {course.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
              <DollarSign className="h-6 w-6" />
              {formatCurrency(course.price)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
