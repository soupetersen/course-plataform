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
  uploadError?: string | null;
  uploadProgress?: number;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  register,
  errors,
  selectedType,
  watch,
  onVideoUpload,
  isUploadingVideo,
  uploadError,
  uploadProgress = 0,
}) => {
  const videoUrl = watch("videoUrl");
  const duration = watch("duration");

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("O arquivo é muito grande. O tamanho máximo permitido é 50MB.");
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Tipo de arquivo não suportado. Apenas vídeos MP4, MPEG, MOV, AVI e WebM são permitidos."
      );
      event.target.value = "";
      return;
    }

    await onVideoUpload(event);
  };

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
              accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
              onChange={handleFileChange}
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
        {isUploadingVideo && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
              <span>Enviando vídeo...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Limite máximo: 50MB. Compressão automática aplicada quando
              necessário.
            </p>
          </div>
        )}
        {uploadError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center justify-between">
            <span>{uploadError}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const fileInput = document.querySelector(
                  'input[type="file"][accept*="video"]'
                ) as HTMLInputElement;
                if (fileInput) {
                  fileInput.value = "";
                  fileInput.click();
                }
              }}
              className="ml-2 h-6 text-xs"
            >
              Tentar novamente
            </Button>
          </div>
        )}
        {videoUrl && !uploadError && !isUploadingVideo && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            <div className="flex items-center justify-between">
              <span>✅ Vídeo configurado</span>
              {duration > 0 && (
                <span className="font-mono bg-green-100 px-2 py-1 rounded text-xs">
                  Duração: {formatDuration(duration)}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-green-600 break-all">
              {videoUrl}
            </div>
          </div>
        )}
      </div>

      <input
        type="hidden"
        {...register("duration", {
          min: { value: 0, message: "Duração não pode ser negativa" },
          valueAsNumber: true,
        })}
      />

      {duration > 0 && (
        <div className="p-3 bg-blue-100 border border-blue-200 rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 font-medium">
              📹 Informações do Vídeo
            </span>
          </div>
          <div className="mt-2 text-sm text-blue-700">
            <div className="flex justify-between items-center">
              <span>Duração total:</span>
              <span className="font-mono bg-blue-200 px-2 py-1 rounded text-xs">
                {formatDuration(duration)} ({duration}s)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
