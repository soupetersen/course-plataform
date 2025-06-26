import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, HelpCircle } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { QuestionCard } from "./QuestionCard";
import { QuizQuestion, QuizFormData } from "./types";

interface QuestionsListProps {
  questionFields: { id: string }[];
  questions: QuizQuestion[];
  register: UseFormRegister<QuizFormData>;
  errors: FieldErrors<QuizFormData>;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onToggleCorrect: (questionIndex: number, optionIndex: number) => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questionFields,
  questions,
  register,
  errors,
  onAddQuestion,
  onRemoveQuestion,
  onAddOption,
  onRemoveOption,
  onToggleCorrect,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Perguntas ({questionFields.length})
        </h3>
        <Button
          type="button"
          onClick={onAddQuestion}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Pergunta
        </Button>
      </div>

      {questionFields.map((field, questionIndex) => (
        <QuestionCard
          key={field.id}
          questionIndex={questionIndex}
          question={questions[questionIndex]}
          totalQuestions={questionFields.length}
          register={register}
          errors={errors}
          onRemoveQuestion={onRemoveQuestion}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onToggleCorrect={onToggleCorrect}
        />
      ))}

      {questionFields.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma pergunta criada
            </h3>
            <p className="text-gray-600 mb-4">
              Adicione pelo menos uma pergunta para o quiz
            </p>
            <Button onClick={onAddQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Pergunta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

