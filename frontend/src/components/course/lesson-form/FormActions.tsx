import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  isUploadingVideo: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting,
  isUploadingVideo,
  isEditing,
  onCancel,
}) => {
  return (
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
        {isEditing ? "Atualizar" : "Criar"} Aula
      </Button>
    </div>
  );
};

