import React from "react";
import { Review } from "@/types/api";
import { StarRating } from "./StarRating";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  isLoading?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const canEdit = currentUserId === review.userId;
  const userName = review.user?.name || "Usuário Anônimo";
  const userInitials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gray-200 text-gray-700">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900">{userName}</h4>
              <div className="flex items-center space-x-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-sm text-gray-500">{formattedDate}</span>
              </div>
            </div>
          </div>

          {canEdit && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(review)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(review.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {review.comment && (
        <CardContent className="pt-0">
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </CardContent>
      )}
    </Card>
  );
};
