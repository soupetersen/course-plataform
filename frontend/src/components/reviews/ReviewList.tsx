import React from "react";
import { Review } from "@/types/api";
import { ReviewCard } from "./ReviewCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  currentUserId,
  onEdit,
  onDelete,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, starIndex) => (
                      <div
                        key={starIndex}
                        className="w-4 h-4 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma avaliação ainda
          </h3>
          <p className="text-gray-600">Seja o primeiro a avaliar este curso!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="min-w-[120px]"
          >
            {loadingMore ? "Carregando..." : "Ver mais avaliações"}
          </Button>
        </div>
      )}
    </div>
  );
};
