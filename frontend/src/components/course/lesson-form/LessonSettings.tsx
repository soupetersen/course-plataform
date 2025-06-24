import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LessonType } from "@/types/api";
import type { UseFormWatch, UseFormSetValue } from "react-hook-form";

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

interface LessonSettingsProps {
  watch: UseFormWatch<LessonFormData>;
  setValue: UseFormSetValue<LessonFormData>;
}

export const LessonSettings: React.FC<LessonSettingsProps> = ({ watch, setValue }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isPreview">Aula Gratuita</Label>
            <p className="text-sm text-gray-600">
              Permitir acesso sem inscrição
            </p>
          </div>
          <Switch
            id="isPreview"
            checked={watch("isPreview")}
            onCheckedChange={(checked) => setValue("isPreview", checked)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isLocked">Aula Bloqueada</Label>
            <p className="text-sm text-gray-600">
              Requer aulas anteriores completas
            </p>
          </div>
          <Switch
            id="isLocked"
            checked={watch("isLocked")}
            onCheckedChange={(checked) => setValue("isLocked", checked)}
          />
        </div>
      </div>
    </div>
  );
};
