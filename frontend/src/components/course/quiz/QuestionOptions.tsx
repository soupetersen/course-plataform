import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { QuestionOption, QuizFormData } from "./types";

interface QuestionOptionsProps {
  questionIndex: number;
  options: QuestionOption[];
  register: UseFormRegister<QuizFormData>;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onToggleCorrect: (questionIndex: number, optionIndex: number) => void;
}

export const QuestionOptions: React.FC<QuestionOptionsProps> = ({
  questionIndex,
  options,
  register,
  onAddOption,
  onRemoveOption,
  onToggleCorrect,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <Label>Opções de Resposta</Label>
        <Button
          type="button"
          onClick={() => onAddOption(questionIndex)}
          variant="outline"
          size="sm"
        >
          <Plus className="w-3 h-3 mr-1" />
          Opção
        </Button>
      </div>

      <div className="space-y-2">
        {options?.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleCorrect(questionIndex, optionIndex)}
              className={`${
                option.isCorrect
                  ? "text-green-600 hover:text-green-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {option.isCorrect ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
            </Button>
            <Input
              {...register(
                `questions.${questionIndex}.options.${optionIndex}.text`,
                {
                  required: "Texto da opção é obrigatório",
                }
              )}
              placeholder={`Opção ${optionIndex + 1}`}
              className="flex-1"
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveOption(questionIndex, optionIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
