export interface EntityBase {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

export type UserRole = 'student' | 'instructor' | 'admin';

export interface CourseFilters {
  categoryId?: string;
  instructorId?: string;
  isPublished?: boolean;
  priceMin?: number;
  priceMax?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface BusinessError extends Error {
  code: string;
  statusCode: number;
}

export interface QueryOptions {
  include?: string[];
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
}

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: any;
  occurredAt: Date;
}

export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn?: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  bcryptSaltRounds: number;
}
