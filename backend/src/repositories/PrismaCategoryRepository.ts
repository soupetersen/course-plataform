import { CategoryRepository } from '@/interfaces/CategoryRepository';
import { Category } from '@/models/Category';
import { PrismaClient } from '@prisma/client';

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<Category>): Promise<Category> {
    const createData = {
      id: data.id!,
      name: data.name!,
      description: data.description,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    const category = await this.prisma.category.create({ data: createData });
    return new Category({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) return null;
    return new Category({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return categories.map(category => new Category({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const updateData = {
      name: data.name,
      description: data.description,
      updatedAt: new Date(),
    };
    const category = await this.prisma.category.update({ where: { id }, data: updateData });
    return new Category({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}
