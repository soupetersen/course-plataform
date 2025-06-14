export interface CreateCourseDto {
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  categoryId?: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  categoryId?: string;
  isPublished?: boolean;
}

export interface CourseResponseDto {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  categoryId?: string;
  isPublished: boolean;
  instructorId: string;
  modulesCount?: number;
  enrollmentsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  modules?: ModuleResponseDto[];
  instructor?: UserResponseDto;
}

interface ModuleResponseDto {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessonsCount?: number;
}

interface UserResponseDto {
  id: string;
  name: string;
  email: string;
}
