import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { LessonType } from "@/types/api";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  type: LessonType;
  order: number;
  videoUrl: string;
  duration: number;
  isPreview: boolean;
  isLocked: boolean;
  quizPassingScore: number;
}

interface QuizConfigurationProps {
  register: UseFormRegister<LessonFormData>;
  errors: FieldErrors<LessonFormData>;
  selectedType: LessonType;
}

export const QuizConfiguration: React.FC<QuizConfigurationProps> = ({ 
  register, 
  errors, 
  selectedType 
}) => {
  if (selectedType !== "QUIZ") return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-medium text-yellow-900">
        Configurações do Quiz
      </h3>

      <div>
        <Label htmlFor="quizPassingScore">Nota Mínima para Passar (%)*</Label>
        <Input
          id="quizPassingScore"
          type="number"
          min="0"
          max="100"
          {...register("quizPassingScore", {
            required: selectedType === "QUIZ" ? "Nota mínima é obrigatória para quizzes" : false,
            min: { value: 0, message: "Mínimo é 0%" },
            max: { value: 100, message: "Máximo é 100%" },
            valueAsNumber: true,
          })}
          placeholder="Ex: 70"
          className={errors.quizPassingScore ? "border-red-500" : ""}
        />
        {errors.quizPassingScore && (
          <p className="text-red-500 text-sm mt-1">
            {String(errors.quizPassingScore.message)}
          </p>
        )}
        <p className="text-xs text-gray-600 mt-1">
          Alunos devem atingir esta nota para prosseguir para a próxima aula
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
        <h4 className="font-medium text-blue-900 mb-2">📝 Como criar o quiz:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Adicione o conteúdo da aula no campo "Conteúdo"</li>
          <li>2. Use o formato: pergunta, opções (a, b, c, d) e resposta correta</li>
          <li>3. Exemplo: "Qual é 2+2? a) 3 b) 4 c) 5 d) 6 - Resposta: b"</li>
          <li>4. Para múltiplas perguntas, separe cada uma com uma linha em branco</li>
        </ol>
      </div>
    </div>
  );
};
