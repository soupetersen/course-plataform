import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import type { LessonType } from "@/types/api";
import type {
  FieldErrors,
  UseFormRegister,
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

interface VideoSectionProps {
  register: UseFormRegister<LessonFormData>;
  errors: FieldErrors<LessonFormData>;
  selectedType: LessonType;
  watch: UseFormWatch<LessonFormData>;
  onVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploadingVideo: boolean;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  register,
  errors,
  selectedType,
  watch,
  onVideoUpload,
  isUploadingVideo,
}) => {
  const videoUrl = watch("videoUrl");

  if (selectedType !== "VIDEO") return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-medium text-blue-900">
        Configurações de Vídeo
      </h3>

      <div>
        <Label htmlFor="videoUrl">URL do Vídeo</Label>
        <div className="flex space-x-2">
          <Input
            id="videoUrl"
            {...register("videoUrl", {
              required: "URL do vídeo é obrigatória para aulas de vídeo",
            })}
            placeholder="https://..."
            className={errors.videoUrl ? "border-red-500" : ""}
          />
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={onVideoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploadingVideo}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploadingVideo}
              className="whitespace-nowrap"
            >
              {isUploadingVideo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        {errors.videoUrl && (
          <p className="text-red-500 text-sm mt-1">
            {String(errors.videoUrl.message)}
          </p>
        )}
        {videoUrl && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            Vídeo configurado: {videoUrl}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="duration">Duração (segundos)</Label>
        <Input
          id="duration"
          type="number"
          min="0"
          {...register("duration", {
            min: { value: 0, message: "Duração não pode ser negativa" },
            valueAsNumber: true,
          })}
          placeholder="Ex: 300 (5 minutos)"
          className={errors.duration ? "border-red-500" : ""}
        />
        {errors.duration && (
          <p className="text-red-500 text-sm mt-1">
            {String(errors.duration.message)}
          </p>
        )}
      </div>
    </div>
  );
};
