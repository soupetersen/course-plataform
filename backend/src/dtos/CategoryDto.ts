export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
