import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LessonType } from "@/types/api";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface LessonFormFields {
  title: string;
  description: string;
  type: LessonType;
  order: number;
  content: string;
  videoUrl: string;
  duration: number;
  isPreview: boolean;
  isLocked: boolean;
  quizPassingScore: number;
}

interface LessonBasicInfoProps {
  register: UseFormRegister<LessonFormFields>;
  errors: FieldErrors<LessonFormFields>;
  selectedType: LessonType;
  onTypeChange: (type: LessonType) => void;
}

const lessonTypeOptions = [
  {
    value: "TEXT" as const,
    label: "Texto",
    description: "Aula baseada em texto e imagens",
  },
  {
    value: "VIDEO" as const,
    label: "Vídeo",
    description: "Aula em formato de vídeo",
  },
  {
    value: "QUIZ" as const,
    label: "Quiz",
    description: "Questionário interativo",
  },
  {
    value: "ASSIGNMENT" as const,
    label: "Tarefa",
    description: "Exercício prático para o aluno",
  },
];

export const LessonBasicInfo: React.FC<LessonBasicInfoProps> = ({
  register,
  errors,
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">Título da Aula*</Label>
          <Input
            id="title"
            {...register("title", {
              required: "Título é obrigatório",
              minLength: {
                value: 3,
                message: "Título deve ter pelo menos 3 caracteres",
              },
            })}
            placeholder="Ex: Introdução ao JavaScript"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {String(errors.title.message)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="type">Tipo de Aula*</Label>
          <Select value={selectedType} onValueChange={onTypeChange}>
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
            <p className="text-red-500 text-sm mt-1">
              {String(errors.type.message)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="order">Ordem</Label>
          <Input
            id="order"
            type="number"
            min="1"
            {...register("order", {
              required: "Ordem é obrigatória",
              min: { value: 1, message: "Ordem deve ser maior que 0" },
              valueAsNumber: true,
            })}
            className={errors.order ? "border-red-500" : ""}
          />
          {errors.order && (
            <p className="text-red-500 text-sm mt-1">
              {String(errors.order.message)}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Breve descrição da aula..."
          rows={2}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {String(errors.description.message)}
          </p>
        )}
      </div>
    </div>
  );
};

