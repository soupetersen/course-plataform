export interface CreateEnrollmentDto {
  courseId: string;
}

export interface EnrollmentResponseDto {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
  course?: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
  };
}

export interface EnrollmentProgressDto {
  enrollmentId: string;
  completedLessons: number;
  totalLessons: number;
  progress: number;
  lastAccessedAt?: Date;
}
