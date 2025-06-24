import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LessonBasicInfo,
  VideoSection,
  QuizConfiguration,
  ContentSection,
  LessonSettings,
  FormActions,
} from "./lesson-form";
import type {
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
  LessonType,
} from "@/types/api";
import { useCreateLesson, useUpdateLesson } from "@/hooks/useModulesAndLessons";
import { useUploadVideo } from "@/hooks/useLessons";

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
  quizPassingScore: number;
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
  const uploadVideo = useUploadVideo();
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const form = useForm<LessonFormData>({
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
      quizPassingScore: lesson?.quizPassingScore || 70,
    },
  });

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;
  const selectedType = watch("type");

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
          quizPassingScore:
            data.type === "QUIZ" ? data.quizPassingScore : undefined,
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
          quizPassingScore:
            data.type === "QUIZ" ? data.quizPassingScore : undefined,
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

    // Validar tipo de arquivo
    if (!file.type.startsWith("video/")) {
      alert("Por favor, selecione um arquivo de vídeo válido.");
      return;
    }

    // Validar tamanho (500MB máximo)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert("O arquivo de vídeo deve ter no máximo 500MB.");
      return;
    }

    setIsUploadingVideo(true);
    try {
      // Upload real para S3 via backend
      const response = await uploadVideo.mutateAsync(file);

      if (response && response.data && response.data.url) {
        setValue("videoUrl", response.data.url);

        // Obter duração do vídeo
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          setValue("duration", Math.round(video.duration));
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      }
    } catch (error) {
      console.error("Video upload error:", error);
      alert("Erro ao fazer upload do vídeo. Tente novamente.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

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
        <LessonBasicInfo
          register={register}
          errors={errors}
          selectedType={selectedType}
          onTypeChange={(type) => setValue("type", type)}
        />

        <QuizConfiguration
          register={register}
          errors={errors}
          selectedType={selectedType}
        />

        <VideoSection
          register={register}
          errors={errors}
          selectedType={selectedType}
          watch={watch}
          onVideoUpload={handleVideoFileUpload}
          isUploadingVideo={isUploadingVideo}
        />

        <ContentSection
          register={register}
          errors={errors}
          selectedType={selectedType}
          watch={watch}
          setValue={setValue}
        />

        <LessonSettings watch={watch} setValue={setValue} />

        <FormActions
          isSubmitting={isSubmitting}
          isUploadingVideo={isUploadingVideo}
          isEditing={!!lesson}
          onCancel={onCancel}
        />
      </form>
    </div>
  );
};
