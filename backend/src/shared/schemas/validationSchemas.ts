import { z } from 'zod';


export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional()
});


export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be non-negative'),
  categoryId: z.string().uuid('Invalid category ID'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional()
});

export const updateCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  imageUrl: z.string().url('Invalid imageUrl').optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  isPublished: z.boolean().optional()
});


export const createModuleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  courseId: z.string().uuid('Invalid course ID'),
  order: z.number().int().min(1, 'Order must be a positive integer')
});

export const updateModuleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  order: z.number().int().min(1, 'Order must be a positive integer').optional()
});


export const createLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  moduleId: z.string().uuid('Invalid module ID'),
  order: z.number().int().min(1, 'Order must be a positive integer'),
  duration: z.number().int().min(1, 'Duration must be a positive integer'),
  videoUrl: z.string().url('Invalid video URL').optional(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ']).optional()
});

export const updateLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').optional(),
  order: z.number().int().min(1, 'Order must be a positive integer').optional(),
  duration: z.number().int().min(1, 'Duration must be a positive integer').optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ']).optional()
});


export const createPaymentSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  paymentType: z.enum(['ONE_TIME', 'SUBSCRIPTION']),
  amount: z.number().min(0, 'Amount must be non-negative')
});

export const webhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any()
  })
});


export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
  search: z.string().optional(),
  category: z.string().uuid('Invalid category ID').optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional()
});
