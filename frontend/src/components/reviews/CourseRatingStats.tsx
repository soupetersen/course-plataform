import React from "react";
import { CourseRatingStats } from "@/types/api";
import { StarRating } from "./StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface CourseRatingStatsProps {
  stats: CourseRatingStats;
  className?: string;
}

export const CourseRatingStatsComponent: React.FC<CourseRatingStatsProps> = ({
  stats,
  className,
}) => {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Avaliações</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="lg" />
          <p className="text-sm text-gray-600 mt-2">
            {totalReviews} {totalReviews === 1 ? "avaliação" : "avaliações"}
          </p>
        </div>

        {totalReviews > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Distribuição das notas
            </h4>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                ratingDistribution[rating as keyof typeof ratingDistribution] ||
                0;
              const percentage = getPercentage(count);

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {totalReviews === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">
              Este curso ainda não possui avaliações
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
