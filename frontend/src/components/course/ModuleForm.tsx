import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useCreateModule, useUpdateModule } from "@/hooks/useModulesAndLessons";
import type { CreateModuleInput, Module } from "@/types/api";

interface ModuleFormProps {
  courseId: string;
  module?: Module | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ModuleFormData {
  title: string;
  description: string;
  order: number;
}

export const ModuleForm: React.FC<ModuleFormProps> = ({
  courseId,
  module,
  onSuccess,
  onCancel,
}) => {
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ModuleFormData>({
    defaultValues: {
      title: module?.title || "",
      description: module?.description || "",
      order: module?.order || 1,
    },
  });

  const onSubmit = async (data: ModuleFormData) => {
    try {
      if (module) {
        
        await updateModule.mutateAsync({
          id: module.id,
          data: {
            title: data.title,
            description: data.description,
            order: data.order,
          },
        });
      } else {
        
        const moduleData: CreateModuleInput = {
          title: data.title,
          description: data.description,
          order: data.order,
          courseId,
        };
        await createModule.mutateAsync(moduleData);
      }
      onSuccess();
    } catch (error) {
      console.error("Module form error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {}
      {(createModule.error || updateModule.error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {createModule.error?.message ||
              updateModule.error?.message ||
              "Erro ao salvar mÃ³dulo"}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {}
        <div>
          <Label htmlFor="title">TÃ­tulo do MÃ³dulo*</Label>
          <Input
            id="title"
            {...register("title", {
              required: "TÃ­tulo Ã© obrigatÃ³rio",
              minLength: {
                value: 3,
                message: "TÃ­tulo deve ter pelo menos 3 caracteres",
              },
            })}
            placeholder="Ex: IntroduÃ§Ã£o ao React"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {}
        <div>
          <Label htmlFor="description">DescriÃ§Ã£o</Label>
          <Textarea
            id="description"
            {...register("description", {
              minLength: {
                value: 10,
                message: "DescriÃ§Ã£o deve ter pelo menos 10 caracteres",
              },
            })}
            placeholder="Descreva o que serÃ¡ abordado neste mÃ³dulo..."
            rows={3}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {}
        <div>
          <Label htmlFor="order">Ordem</Label>
          <Input
            id="order"
            type="number"
            min="1"
            {...register("order", {
              required: "Ordem Ã© obrigatÃ³ria",
              min: { value: 1, message: "Ordem deve ser maior que 0" },
              valueAsNumber: true,
            })}
            placeholder="1"
            className={errors.order ? "border-red-500" : ""}
          />
          {errors.order && (
            <p className="text-red-500 text-sm mt-1">{errors.order.message}</p>
          )}
        </div>

        {}
        <div className="flex justify-end space-x-3 pt-4">
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
            disabled={isSubmitting}
            className="bg-[#FF204E] hover:bg-[#E01D4A]"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {module ? "Atualizar" : "Criar"} MÃ³dulo
          </Button>
        </div>
      </form>
    </div>
  );
};
