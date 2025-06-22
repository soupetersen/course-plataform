import React from "react";
import { Check, CreditCard, ShoppingCart, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PaymentStepsProps {
  currentStep: string;
  completedSteps: string[];
  onStepChange: (stepId: string) => void;
}

const steps: Step[] = [
  {
    id: "cart",
    title: "Carrinho",
    description: "Revisar produto",
    icon: ShoppingCart,
  },
  {
    id: "payment",
    title: "Método de Pagamento",
    description: "Escolha e configure",
    icon: CreditCard,
  },
  {
    id: "checkout",
    title: "Finalizar Pagamento",
    description: "Concluir pedido",
    icon: Receipt,
  },
];

export function PaymentSteps({
  currentStep,
  completedSteps,
  onStepChange,
}: PaymentStepsProps) {
  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isClickable = isCompleted || isCurrent;

            return (
              <li key={step.id} className="relative flex-1">
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-4 left-4 -ml-px mt-0.5 h-0.5 w-full transition-all duration-500 ease-in-out",
                      isCompleted ||
                        completedSteps.includes(steps[stepIdx + 1]?.id)
                        ? "bg-primary scale-y-150"
                        : "bg-gray-300"
                    )}
                    aria-hidden="true"
                  />
                )}

                <button
                  onClick={() => isClickable && onStepChange(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "group relative flex w-full flex-col items-center py-2 text-sm font-medium transition-colors",
                    isClickable
                      ? "cursor-pointer hover:text-primary"
                      : "cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground scale-110"
                        : isCurrent
                        ? "border-primary bg-background text-primary scale-105 shadow-md"
                        : "border-gray-300 bg-background text-gray-500 hover:border-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </span>

                  <span
                    className={cn(
                      "mt-2 text-xs font-medium transition-all duration-300",
                      isCurrent
                        ? "text-primary scale-105 font-semibold"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>

                  <span
                    className={cn(
                      "mt-1 text-xs transition-all duration-300",
                      isCurrent
                        ? "text-primary/70 scale-105"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
