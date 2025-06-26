import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import type { LessonType } from "@/types/api";

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

interface LessonTypeSelectProps {
  form: UseFormReturn<LessonFormData>;
}

const lessonTypeOptions = [
  {
    value: "TEXT" as LessonType,
    label: "Texto",
    description: "Aula baseada em texto e imagens",
  },
  {
    value: "VIDEO" as LessonType,
    label: "Vídeo",
    description: "Aula em formato de vídeo",
  },
  {
    value: "QUIZ" as LessonType,
    label: "Quiz",
    description: "Questionário interativo",
  },
  {
    value: "ASSIGNMENT" as LessonType,
    label: "Tarefa",
    description: "Exercício prático para o aluno",
  },
];

export const LessonTypeSelect: React.FC<LessonTypeSelectProps> = ({ form }) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const selectedType = watch("type");

  return (
    <div>
      <Label htmlFor="type">Tipo de Aula*</Label>
      <Select
        value={selectedType}
        onValueChange={(value: LessonType) => setValue("type", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          {lessonTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500">
                  {option.description}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.type && (
        <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
      )}
    </div>
  );
};

