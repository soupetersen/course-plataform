import React, { useState } from "react";
import { Star, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/reviews/ReviewForm";

interface CourseReviewPromptProps {
  courseTitle: string;
  progress: number;
  onSubmit: (data: { rating: number; comment: string }) => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export const CourseReviewPrompt: React.FC<CourseReviewPromptProps> = ({
  courseTitle,
  progress,
  onSubmit,
  onDismiss,
  isLoading = false,
}) => {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (data: { rating: number; comment: string }) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <Card className="mb-6 border-l-4 border-l-primary bg-gradient-to-r from-blue-50/50 to-indigo-50/30 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  Avaliar Curso
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Compartilhe sua experiência com {courseTitle}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ReviewForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-l-4 border-l-primary bg-gradient-to-r from-blue-50/50 to-indigo-50/30 shadow-md animate-slide-in-down">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="bg-primary/10 p-3 rounded-full">
              <Heart className="w-6 h-6 text-primary" />
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Como está sendo sua experiência?
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {Math.round(progress)}% concluído
                </Badge>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                Você já concluiu <strong>{Math.round(progress)}%</strong> do
                curso <strong>{courseTitle}</strong>. Que tal compartilhar sua
                opinião para ajudar outros estudantes?
              </p>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Avaliar Curso
                </Button>

                <Button
                  variant="outline"
                  onClick={onDismiss}
                  className="text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  Talvez mais tarde
                </Button>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

