import { randomUUID } from 'crypto';

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export class User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    email: string;
    name: string;
    password: string;
    role: UserRole;
    avatar?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.email = params.email;
    this.name = params.name;
    this.password = params.password;
    this.role = params.role;
    this.avatar = params.avatar;
    this.isActive = params.isActive ?? true;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  static create(params: {
    email: string;
    name: string;
    password: string;
    role: UserRole;
    avatar?: string;
  }): User {
    return new User({
      id: randomUUID(),
      email: params.email,
      name: params.name,
      password: params.password,
      role: params.role,
      avatar: params.avatar,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export { User as UserEntity };
