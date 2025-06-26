import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MDXEditor } from "../MDXEditor";
import type { LessonType } from "@/types/api";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

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

interface ContentSectionProps {
  register: UseFormRegister<LessonFormData>;
  errors: FieldErrors<LessonFormData>;
  selectedType: LessonType;
  watch: UseFormWatch<LessonFormData>;
  setValue: UseFormSetValue<LessonFormData>;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  register,
  errors,
  selectedType,
  watch,
  setValue,
}) => {
  return (
    <div>
      <Label htmlFor="content">
        {selectedType === "TEXT"
          ? "Conteúdo da Aula (Markdown)*"
          : "Conteúdo da Aula*"}
      </Label>
      {selectedType === "TEXT" ? (
        <MDXEditor
          value={watch("content")}
          onChange={(value) => setValue("content", value)}
          placeholder="Digite o conteúdo da aula usando Markdown..."
          error={
            errors.content?.message ? String(errors.content.message) : undefined
          }
          height={300}
        />
      ) : (
        <Textarea
          id="content"
          {...register("content", {
            required: "Conteúdo é obrigatório",
            minLength: {
              value: 10,
              message: "Conteúdo deve ter pelo menos 10 caracteres",
            },
          })}
          placeholder={
            selectedType === "VIDEO"
              ? "Descrição do vídeo, pontos principais, recursos adicionais..."
              : selectedType === "QUIZ"
              ? "Instruções do quiz, perguntas, alternativas..."
              : "Conteúdo da aula em formato markdown ou texto..."
          }
          rows={8}
          className={errors.content ? "border-red-500" : ""}
        />
      )}
      {selectedType !== "TEXT" && errors.content && (
        <p className="text-red-500 text-sm mt-1">
          {String(errors.content.message)}
        </p>
      )}
    </div>
  );
};

