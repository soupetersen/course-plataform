import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuizBuilder } from "./QuizBuilderRefactored";
import type { QuizFormData } from "./quiz/types";
import type { Question } from "@/types/lesson";

interface QuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId?: string;
  initialData?: {
    title?: string;
    description?: string;
    passThreshold?: number;
    questions?: Question[];
  };
}

export const QuizDialog: React.FC<QuizDialogProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const handleSave = async (data: QuizFormData) => {
    try {
      console.log("Saving quiz data:", data);
      onClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Quiz" : "Criar Novo Quiz"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <QuizBuilder
            initialData={initialData}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
