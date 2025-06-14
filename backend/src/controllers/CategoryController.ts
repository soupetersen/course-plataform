import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { CategoryRepository } from '@/interfaces/CategoryRepository';
import { CreateCategoryDto, UpdateCategoryDto } from '@/dtos/CategoryDto';
import { randomUUID } from 'crypto';

interface CategoryParams {
  id: string;
}

export class CategoryController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      
      if (userInfo.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          message: 'Only administrators can create categories'
        });
      }

      const createCategoryDto = request.body as CreateCategoryDto;
      
      const categoryRepository = this.container.resolve<CategoryRepository>('CategoryRepository');
      
      
      const categoryData = {
        id: randomUUID(),
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const category = await categoryRepository.create(categoryData);

      reply.status(201).send({
        success: true,
        data: category
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create category'
      });
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const categoryRepository = this.container.resolve<CategoryRepository>('CategoryRepository');
      const categories = await categoryRepository.findAll();

      reply.send({
        success: true,
        data: categories
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories'
      });
    }
  }

  async findById(request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      
      const categoryRepository = this.container.resolve<CategoryRepository>('CategoryRepository');
      const category = await categoryRepository.findById(id);

      if (!category) {
        return reply.status(404).send({
          success: false,
          message: 'Category not found'
        });
      }

      reply.send({
        success: true,
        data: category
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch category'
      });
    }
  }

  async update(request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      
      if (userInfo.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          message: 'Only administrators can update categories'
        });
      }

      const { id } = request.params;
      const updateCategoryDto = request.body as UpdateCategoryDto;

      const categoryRepository = this.container.resolve<CategoryRepository>('CategoryRepository');
      
      const existingCategory = await categoryRepository.findById(id);
      if (!existingCategory) {
        return reply.status(404).send({
          success: false,
          message: 'Category not found'
        });
      }

      const updatedCategory = await categoryRepository.update(id, updateCategoryDto);

      reply.send({
        success: true,
        data: updatedCategory
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update category'
      });
    }
  }

  async delete(request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      
      if (userInfo.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          message: 'Only administrators can delete categories'
        });
      }

      const { id } = request.params;

      const categoryRepository = this.container.resolve<CategoryRepository>('CategoryRepository');
      
      const existingCategory = await categoryRepository.findById(id);
      if (!existingCategory) {
        return reply.status(404).send({
          success: false,
          message: 'Category not found'
        });
      }

      await categoryRepository.delete(id);

      reply.send({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete category'
      });
    }
  }
}
