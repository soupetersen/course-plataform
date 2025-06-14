import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload } from "lucide-react";
import type {
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
  LessonType,
} from "@/types/api";
import { useCreateLesson, useUpdateLesson } from "@/hooks/useModulesAndLessons";

interface LessonFormProps {
  courseId: string;
  moduleId: string;
  lesson?: Lesson | null;
  onSuccess: () => void;
  onCancel: () => void;
}

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
}

export const LessonForm: React.FC<LessonFormProps> = ({
  courseId,
  moduleId,
  lesson,
  onSuccess,
  onCancel,
}) => {
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    defaultValues: {
      title: lesson?.title || "",
      description: lesson?.description || "",
      content: lesson?.content || "",
      type: (lesson?.type as LessonType) || "TEXT",
      order: lesson?.order || 1,
      videoUrl: lesson?.videoUrl || "",
      duration: lesson?.duration || 0,
      isPreview: lesson?.isPreview || false,
      isLocked: lesson?.isLocked || false,
    },
  });

  const selectedType = watch("type");
  const videoUrl = watch("videoUrl");

  const onSubmit = async (data: LessonFormData) => {
    try {
      if (lesson) {
        const updateData: UpdateLessonInput = {
          title: data.title,
          content: data.content,
          description: data.description,
          videoUrl: data.type === "VIDEO" ? data.videoUrl : undefined,
          duration: data.duration,
          order: data.order,
          type: data.type,
          isPreview: data.isPreview,
          isLocked: data.isLocked,
        };

        await updateLesson.mutateAsync({
          id: lesson.id,
          data: updateData,
        });
      } else {
        const createData: CreateLessonInput = {
          title: data.title,
          content: data.content,
          description: data.description,
          videoUrl: data.type === "VIDEO" ? data.videoUrl : undefined,
          duration: data.duration,
          order: data.order,
          moduleId,
          courseId,
          type: data.type,
          isPreview: data.isPreview,
          isLocked: data.isLocked,
        };

        await createLesson.mutateAsync(createData);
      }
      onSuccess();
    } catch (error) {
      console.error("Lesson form error:", error);
    }
  };

  const handleVideoFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockUrl = `https://storage.example.com/videos/${file.name}`;
      setValue("videoUrl", mockUrl);

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setValue("duration", Math.round(video.duration));
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Video upload error:", error);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const lessonTypeOptions = [
    {
      value: "TEXT",
      label: "Texto",
      description: "Aula baseada em texto e imagens",
    },
    { value: "VIDEO", label: "Vídeo", description: "Aula em formato de vídeo" },
    { value: "QUIZ", label: "Quiz", description: "Questionário interativo" },
    {
      value: "ASSIGNMENT",
      label: "Tarefa",
      description: "Exercício prático para o aluno",
    },
  ];

  return (
    <div className="space-y-6">
      {(createLesson.error || updateLesson.error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {createLesson.error?.message ||
              updateLesson.error?.message ||
              "Erro ao salvar aula"}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {errors.title.message}
              </p>
            )}
          </div>

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
                {errors.order.message}
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
              {errors.description.message}
            </p>
          )}
        </div>

        {selectedType === "VIDEO" && (
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
                    required:
                      selectedType === "VIDEO"
                        ? "URL do vídeo é obrigatória para aulas de vídeo"
                        : false,
                  })}
                  placeholder="https://..."
                  className={errors.videoUrl ? "border-red-500" : ""}
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
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
                  {errors.videoUrl.message}
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
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="content">Conteúdo da Aula*</Label>
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
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

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

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingVideo}
            className="bg-[#FF204E] hover:bg-[#E01D4A]"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {lesson ? "Atualizar" : "Criar"} Aula
          </Button>
        </div>
      </form>
    </div>
  );
};
