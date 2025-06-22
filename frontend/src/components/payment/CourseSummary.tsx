import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface Course {
  id: string;
  title: string;
  price: number;
  description?: string;
}

interface CourseSummaryProps {
  course: Course;
  formatCurrency: (amount: number) => string;
}

export function CourseSummary({ course, formatCurrency }: CourseSummaryProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="w-6 h-6" />
          Resumo do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="font-semibold text-lg">{course.title}</h3>
              {course.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                  {course.description}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-semibold text-lg">
                {formatCurrency(course.price)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
