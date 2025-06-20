import React from "react";
import { useForm } from "react-hook-form";
import { Review } from "@/types/api";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ReviewFormData {
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  review?: Review;
  onSubmit: (data: ReviewFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  review,
  onSubmit,
  onCancel,
  isLoading = false,
  title = review ? "Editar Avaliação" : "Avaliar Curso",
}) => {
  const [rating, setRating] = React.useState(review?.rating || 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ReviewFormData>({
    defaultValues: {
      rating: review?.rating || 0,
      comment: review?.comment || "",
    },
  });

  React.useEffect(() => {
    setValue("rating", rating);
  }, [rating, setValue]);

  const handleFormSubmit = (data: ReviewFormData) => {
    onSubmit({
      ...data,
      rating,
    });
  };

  const commentValue = watch("comment");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rating">Avaliação *</Label>
            <div className="flex items-center space-x-2">
              <StarRating
                rating={rating}
                interactive
                onRatingChange={setRating}
                size="lg"
              />
              <span className="text-sm text-gray-600">
                {rating > 0
                  ? `${rating} estrela${rating > 1 ? "s" : ""}`
                  : "Selecione uma avaliação"}
              </span>
            </div>
            {rating === 0 && (
              <p className="text-sm text-red-600">
                Por favor, selecione uma avaliação de 1 a 5 estrelas
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Compartilhe sua experiência com este curso..."
              className="min-h-[100px] resize-none"
              {...register("comment", {
                maxLength: {
                  value: 1000,
                  message: "O comentário deve ter no máximo 1000 caracteres",
                },
              })}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {errors.comment && (
                  <span className="text-red-600">{errors.comment.message}</span>
                )}
              </span>
              <span>{commentValue?.length || 0}/1000</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || rating === 0}
              className="min-w-[100px]"
            >
              {isLoading ? "Salvando..." : review ? "Atualizar" : "Publicar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
