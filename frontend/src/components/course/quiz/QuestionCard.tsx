import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Trash2 } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { QuestionOptions } from "./QuestionOptions";
import { QuizQuestion, QuizFormData } from "./types";

interface QuestionCardProps {
  questionIndex: number;
  question: QuizQuestion;
  totalQuestions: number;
  register: UseFormRegister<QuizFormData>;
  errors: FieldErrors<QuizFormData>;
  onRemoveQuestion: (index: number) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onToggleCorrect: (questionIndex: number, optionIndex: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionIndex,
  question,
  totalQuestions,
  register,
  errors,
  onRemoveQuestion,
  onAddOption,
  onRemoveOption,
  onToggleCorrect,
}) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Pergunta {questionIndex + 1}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-move"
            >
              <GripVertical className="w-4 h-4" />
            </Button>
            {totalQuestions > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveQuestion(questionIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`questions.${questionIndex}.text`}>
            Texto da Pergunta*
          </Label>
          <Textarea
            {...register(`questions.${questionIndex}.text`, {
              required: "Texto da pergunta é obrigatório",
            })}
            placeholder="Digite a pergunta..."
            rows={2}
          />
          {errors.questions?.[questionIndex]?.text && (
            <p className="text-red-500 text-sm mt-1">
              {errors.questions?.[questionIndex]?.text?.message}
            </p>
          )}
        </div>

        <QuestionOptions
          questionIndex={questionIndex}
          options={question.options}
          register={register}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onToggleCorrect={onToggleCorrect}
        />

        <div>
          <Label htmlFor={`questions.${questionIndex}.explanation`}>
            Explicação (opcional)
          </Label>
          <Textarea
            {...register(`questions.${questionIndex}.explanation`)}
            placeholder="Explique por que esta é a resposta correta..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};
