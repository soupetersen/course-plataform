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
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg lg:text-xl min-w-0">
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
          <span className="truncate">
            <span className="hidden sm:inline">Resumo do Pedido</span>
            <span className="sm:hidden">Resumo</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm md:text-base lg:text-lg leading-tight hyphens-auto break-words">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed break-words">
                  {course.description}
                </p>
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold text-base sm:text-lg break-all">
                {formatCurrency(course.price)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

