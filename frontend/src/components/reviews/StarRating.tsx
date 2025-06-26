import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onRatingChange,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartiallyFilled =
            starValue > displayRating && starValue - 1 < displayRating;

          return (
            <button
              key={index}
              type="button"
              className={cn(
                "transition-colors",
                interactive
                  ? "hover:scale-110 cursor-pointer"
                  : "cursor-default",
                sizeClasses[size]
              )}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
            >
              <Star
                className={cn(
                  "transition-colors",
                  sizeClasses[size],
                  isFilled || isPartiallyFilled
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)} ({maxRating})
        </span>
      )}
    </div>
  );
};

