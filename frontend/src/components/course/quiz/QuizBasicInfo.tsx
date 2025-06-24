import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { QuizFormData } from "./types";

interface QuizBasicInfoProps {
  register: UseFormRegister<QuizFormData>;
  errors: FieldErrors<QuizFormData>;
}

export const QuizBasicInfo: React.FC<QuizBasicInfoProps> = ({
  register,
  errors,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Título do Quiz*</Label>
          <Input
            id="title"
            {...register("title", {
              required: "Título é obrigatório",
            })}
            placeholder="Ex: Quiz sobre JavaScript Básico"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="passThreshold">Nota Mínima para Passar (%)*</Label>
          <Input
            id="passThreshold"
            type="number"
            min="0"
            max="100"
            {...register("passThreshold", {
              required: "Nota mínima é obrigatória",
              min: { value: 0, message: "Mínimo é 0%" },
              max: { value: 100, message: "Máximo é 100%" },
              valueAsNumber: true,
            })}
            placeholder="Ex: 70"
            className={errors.passThreshold ? "border-red-500" : ""}
          />
          {errors.passThreshold && (
            <p className="text-red-500 text-sm mt-1">
              {errors.passThreshold.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Instruções para o quiz..."
          rows={3}
        />
      </div>
    </>
  );
};
