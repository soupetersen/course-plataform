export class Review {
  public readonly id: string;
  public readonly rating: number;
  public readonly comment?: string;
  public readonly userId: string;
  public readonly courseId: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: {
    id: string;
    rating: number;
    comment?: string;
    userId: string;
    courseId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.rating = params.rating;
    this.comment = params.comment;
    this.userId = params.userId;
    this.courseId = params.courseId;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();

    if (this.rating < 1 || this.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
  }

  updateRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
  }

  updateComment(comment: string): void {
    if (comment && comment.length > 500) {
      throw new Error('Comment cannot exceed 500 characters');  
    }
  }
}
