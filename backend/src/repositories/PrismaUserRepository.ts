import { UserRepository } from '@/interfaces/UserRepository';
import { User } from '@/models/User';
import { PrismaClient } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<User>): Promise<User> {
    const createData = {
      id: data.id!,
      email: data.email!,
      name: data.name!,
      password: data.password!,
      role: data.role!,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    const user = await this.prisma.user.create({ data: createData });
    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      avatar: undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      avatar: undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      avatar: undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData = {
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role,
      isActive: data.isActive,
      updatedAt: new Date(),
    };
    const user = await this.prisma.user.update({ where: { id }, data: updateData });
    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      avatar: undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
