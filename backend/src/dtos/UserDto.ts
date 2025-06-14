export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
}
