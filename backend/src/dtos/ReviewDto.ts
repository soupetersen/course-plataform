export interface CreateReviewDto {
  rating: number;
  comment?: string;
  courseId: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export interface ReviewResponseDto {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  courseId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseRatingStatsDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
