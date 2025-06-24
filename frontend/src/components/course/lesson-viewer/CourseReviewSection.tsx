import React, { useState } from "react";
import { Star, Heart, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

interface ReviewFormData {
  rating: number;
  comment: string;
}

interface CourseReviewSectionProps {
  courseTitle: string;
  progress: number;
  onSubmit: (data: { rating: number; comment: string }) => void;
  onDismiss: () => void;
  isLoading?: boolean;
  showDismissButton?: boolean;
}

export const CourseReviewSection: React.FC<CourseReviewSectionProps> = ({
  courseTitle,
  progress,
  onSubmit,
  onDismiss,
  isLoading = false,
  showDismissButton = true,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReviewFormData>({
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const commentValue = watch("comment");

  const handleFormSubmit = (data: ReviewFormData) => {
    if (rating === 0) return;
    
    onSubmit({
      rating,
      comment: data.comment.trim(),
    });
    setIsSubmitted(true);
  };

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1: return "Muito ruim";
      case 2: return "Ruim";
      case 3: return "Regular";
      case 4: return "Bom";
      case 5: return "Excelente";
      default: return "Selecione uma nota";
    }
  };

  if (isSubmitted) {
    return (
      <Card className="mb-6 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-emerald-50/30 shadow-md animate-slide-in-down">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 text-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Obrigado pela sua avaliação!
              </h3>
              <p className="text-gray-600">
                Sua opinião ajuda outros estudantes a escolherem os melhores cursos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-l-4 border-l-primary bg-gradient-to-r from-blue-50/50 to-indigo-50/30 shadow-md animate-slide-in-down">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">
                Como está sendo sua experiência?
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-gray-600">
                  Avalie o curso: <strong>{courseTitle}</strong>
                </p>
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary border-primary/20 text-xs"
                >
                  {Math.round(progress)}% concluído
                </Badge>
              </div>
            </div>
          </div>
          {showDismissButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Sua avaliação *
            </Label>
            
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                  disabled={isLoading}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {getRatingText(hoveredRating || rating)}
                {rating > 0 && ` (${rating} estrela${rating > 1 ? "s" : ""})`}
              </span>
              {rating === 0 && (
                <span className="text-sm text-red-600">
                  Selecione uma nota de 1 a 5 estrelas
                </span>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-sm font-medium text-gray-900">
              Comentário (opcional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Compartilhe o que você achou do curso, o que mais gostou, sugestões de melhoria..."
              className="min-h-[100px] resize-none"
              {...register("comment", {
                maxLength: {
                  value: 500,
                  message: "O comentário deve ter no máximo 500 caracteres",
                },
              })}
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {errors.comment && (
                  <span className="text-red-600">{errors.comment.message}</span>
                )}
              </span>
              <span>{commentValue?.length || 0}/500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading || rating === 0}
              className="bg-primary hover:bg-primary/90 text-white px-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Publicar Avaliação
                </>
              )}
            </Button>
            
            {showDismissButton && (
              <Button
                type="button"
                variant="outline"
                onClick={onDismiss}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800"
              >
                Talvez mais tarde
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Sua avaliação será pública e ajudará outros estudantes a conhecerem melhor este curso.
            Você pode editá-la ou removê-la a qualquer momento.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
