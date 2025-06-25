import { Payment } from './payment';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ValidateResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  website?: string;
  socialLinks?: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  error?: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  website?: string;
  socialLinks?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number;
  language: string;
  requirements?: string[];
  whatYoullLearn?: string[];
  isPublished: boolean;
  categoryId?: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  instructor?: User;
  category?: Category;
  modules?: Module[];
  _count?: {
    enrollments: number;
    modules: number;
    reviews: number;
  };
  rating?: number;
  totalLessons?: number;
  totalDuration?: number;
  enrollmentCount?: number;
  reviewCount?: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryId?: string;
  language?: string;
  requirements?: string[];
  whatYoullLearn?: string[];
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryId?: string;
  language?: string;
  requirements?: string[];
  whatYoullLearn?: string[];
  isPublished?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
  _count?: {
    lessons: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  orderIndex: number;
  moduleId: string;
  courseId: string;
  lessonType: 'VIDEO' | 'TEXT' | 'QUIZ';
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
  module?: Module;
  course?: Course;
  questions?: Question[];
  _count?: {
    questions: number;
  };
}

export interface Question {
  id: string;
  lessonId: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  lessonId: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  orderIndex?: number;
}

export interface UpdateQuestionRequest {
  question?: string;
  type?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  orderIndex?: number;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  completedAt?: string;
  watchTime?: number;
  quizScore?: number;
  quizAttempts?: number;
  createdAt: string;
  updatedAt: string;
  lesson?: Lesson;
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  moduleId: string;
  lessonType: 'VIDEO' | 'TEXT' | 'QUIZ';
  isFree?: boolean;
  orderIndex?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  lessonType?: 'VIDEO' | 'TEXT' | 'QUIZ';
  isFree?: boolean;
  orderIndex?: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  lastAccessedAt?: string;
  user?: User;
  course?: Course;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  course?: Course;
}

export interface CreateReviewRequest {
  courseId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface CreateModuleRequest {
  title: string;
  description?: string;
  courseId: string;
  orderIndex?: number;
}

export interface UpdateModuleRequest {
  title?: string;
  description?: string;
  orderIndex?: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface InstructorBalance {
  id: string;
  instructorId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  lastPayoutAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRequest {
  id: string;
  instructorId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  payoutMethod: 'PIX' | 'BANK_TRANSFER';
  pixKey?: string;
  bankAccount?: {
    bank: string;
    agency: string;
    account: string;
    accountType: string;
  };
  requestMonth: number;
  requestYear: number;
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayoutRequestData {
  amount: number;
  payoutMethod: 'PIX' | 'BANK_TRANSFER';
  pixKey?: string;
  bankAccount?: {
    bank: string;
    agency: string;
    account: string;
    accountType: string;
  };
}

export interface InstructorPayoutResponse {
  success: boolean;
  data: {
    balance: InstructorBalance;
    payoutRequests: PayoutRequest[];
    canRequestPayout: boolean;
    nextPayoutDate?: string;
  };
  error?: string;
}

export interface InstructorEarnings {
  totalEarnings: number;
  pendingEarnings: number;
  availableForPayout: number;
  totalPayouts: number;
  monthlyEarnings: {
    month: string;
    earnings: number;
  }[];
}

export interface InstructorAnalytics {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  topCourses: {
    id: string;
    title: string;
    students: number;
    revenue: number;
  }[];
}

export type ApiEndpoints = {
  getCoursesById: (id: string) => Course;
  createCourse: (data: CreateCourseRequest) => Course;
  updateCourse: (id: string, data: UpdateCourseRequest) => Course;
  deleteCourse: (id: string) => { success: boolean };
  getCoursesByInstructor: (instructorId: string) => Course[];
  publishCourse: (id: string) => Course;
  unpublishCourse: (id: string) => Course;
  getModulesByCourse: (courseId: string) => Module[];
  createModule: (data: CreateModuleRequest) => Module;
  updateModule: (id: string, data: UpdateModuleRequest) => Module;
  deleteModule: (id: string) => { success: boolean };
  getLessonsByModule: (moduleId: string) => Lesson[];
  createLesson: (data: CreateLessonRequest) => Lesson;
  updateLesson: (id: string, data: UpdateLessonRequest) => Lesson;
  deleteLesson: (id: string) => { success: boolean };
  getCategories: () => Category[];
  createCategory: (data: CreateCategoryRequest) => Category;
  updateCategory: (id: string, data: UpdateCategoryRequest) => Category;
  deleteCategory: (id: string) => { success: boolean };
  getEnrollmentsByUser: (userId: string) => Enrollment[];
  getEnrollmentsByCourse: (courseId: string) => Enrollment[];
  createEnrollment: (courseId: string) => Enrollment;
  deleteEnrollment: (id: string) => { success: boolean };
  getPaymentsByUser: (userId: string) => Payment[];
  getReviewsByCourse: (courseId: string) => Review[];
  createReview: (data: CreateReviewRequest) => Review;
  updateReview: (id: string, data: UpdateReviewRequest) => Review;
  deleteReview: (id: string) => { success: boolean };
};
