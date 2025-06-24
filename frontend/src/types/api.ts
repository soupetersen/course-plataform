// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  instructorId: string;
  instructor: User;
  categoryId: string;
  category: Category;  modules: Module[];
  enrollments: Enrollment[];
  duration?: number;
  enrollments_count?: number; 
  averageRating: number;
  reviewCount: number;
  objectives?: string[]; 
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryId: string;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}


export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  course?: Course;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleInput {
  title: string;
  description: string;
  order: number;
  courseId: string;
}

// Lesson types
export type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  description?: string;
  videoUrl?: string;
  duration: number;
  order: number;
  type?: LessonType;
  moduleId: string;
  module?: Module;
  comments: LessonComment[];
  completions: LessonCompletion[];
  isPreview?: boolean;
  isLocked?: boolean;
  quizPassingScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonInput {
  title: string;
  content: string;
  description?: string;
  videoUrl?: string;
  duration: number;
  order: number;
  moduleId: string;
  courseId: string;
  type: LessonType;
  isPreview?: boolean;
  isLocked?: boolean;
  quizPassingScore?: number;
}

export interface UpdateLessonInput extends Partial<CreateLessonInput> {
  id?: string;
}

export interface LessonComment {
  id: string;
  content: string;
  userId: string;
  user: User;
  lessonId: string;
  lesson?: Lesson;
  createdAt: string;
  updatedAt: string;
}

export interface LessonCompletion {
  id: string;
  userId: string;
  user: User;
  lessonId: string;
  lesson?: Lesson;
  completedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  courses: Course[];
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  user: User;
  courseId: string;
  course: Course;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO';
  gatewayPaymentId?: string;
  gateway: 'MERCADOPAGO';
  userId: string;
  user: User;
  courseId?: string;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: 'STUDENT' | 'INSTRUCTOR';
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  user?: User;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  courseId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface CourseRatingStats {
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

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CourseFilters extends PaginationParams {
  categoryId?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  search?: string;
  instructorId?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: unknown[];
}

export const queryKeys = {
  auth: ['auth'] as const,
  user: (id: string) => ['user', id] as const,
  
  // Courses
  courses: ['courses'] as const,
  course: (id: string) => ['course', id] as const,
  coursesByInstructor: (instructorId: string) => ['courses', 'instructor', instructorId] as const,
  
  // Modules
  modules: ['modules'] as const,
  module: (id: string) => ['module', id] as const,
  modulesByCourse: (courseId: string) => ['modules', 'course', courseId] as const,
  
  // Lessons
  lessons: ['lessons'] as const,
  lesson: (id: string) => ['lesson', id] as const,
  lessonsByModule: (moduleId: string) => ['lessons', 'module', moduleId] as const,
  
  // Categories
  categories: ['categories'] as const,
  category: (id: string) => ['category', id] as const,
  
  // Enrollments
  enrollments: ['enrollments'] as const,
  enrollment: (id: string) => ['enrollment', id] as const,
  enrollmentsByUser: (userId: string) => ['enrollments', 'user', userId] as const,
  enrollmentsByCourse: (courseId: string) => ['enrollments', 'course', courseId] as const,
    // Payments
  payments: ['payments'] as const,
  payment: (id: string) => ['payment', id] as const,
  paymentsByUser: (userId: string) => ['payments', 'user', userId] as const,
  
  // Reviews
  reviews: ['reviews'] as const,
  review: (id: string) => ['review', id] as const,
  reviewsByCourse: (courseId: string) => ['reviews', 'course', courseId] as const,
  reviewsByUser: (userId: string) => ['reviews', 'user', userId] as const,
  courseRatingStats: (courseId: string) => ['course', courseId, 'rating-stats'] as const,
} as const;
