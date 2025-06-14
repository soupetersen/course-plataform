import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { CreateModuleUseCase } from '@/use-cases/CreateModuleUseCase';
import { ModuleRepository } from '@/interfaces/ModuleRepository';
import { CreateModuleDto, UpdateModuleDto } from '@/dtos/ModuleDto';

interface ModuleParams {
  id: string;
}

interface CourseParams {
  courseId: string;
}

export class ModuleController {
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

      const createModuleDto = request.body as CreateModuleDto;
      
      const createModuleUseCase = this.container.resolve<CreateModuleUseCase>('CreateModuleUseCase');
      const module = await createModuleUseCase.execute(createModuleDto);

      reply.status(201).send({
        success: true,
        data: module
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create module'
      });
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const moduleRepository = this.container.resolve<ModuleRepository>('ModuleRepository');
      const modules = await moduleRepository.findAll();

      reply.send({
        success: true,
        data: modules
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch modules'
      });
    }
  }

  async findById(request: FastifyRequest<{ Params: ModuleParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;
      
      const moduleRepository = this.container.resolve<ModuleRepository>('ModuleRepository');
      const module = await moduleRepository.findById(id);

      if (!module) {
        return reply.status(404).send({
          success: false,
          message: 'Module not found'
        });
      }

      reply.send({
        success: true,
        data: module
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch module'
      });
    }
  }

  async findByCourseId(request: FastifyRequest<{ Params: CourseParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { courseId } = request.params;
      
      const moduleRepository = this.container.resolve<ModuleRepository>('ModuleRepository');
      const modules = await moduleRepository.findByCourseId(courseId);

      reply.send({
        success: true,
        data: modules
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch modules'
      });
    }
  }

  async update(request: FastifyRequest<{ Params: ModuleParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;
      const updateModuleDto = request.body as UpdateModuleDto;

      const moduleRepository = this.container.resolve<ModuleRepository>('ModuleRepository');
      
      const existingModule = await moduleRepository.findById(id);
      if (!existingModule) {
        return reply.status(404).send({
          success: false,
          message: 'Module not found'
        });
      }

      existingModule.update(updateModuleDto);
      const updatedModule = await moduleRepository.update(id, existingModule);

      reply.send({
        success: true,
        data: updatedModule
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update module'
      });
    }
  }

  async delete(request: FastifyRequest<{ Params: ModuleParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;

      const moduleRepository = this.container.resolve<ModuleRepository>('ModuleRepository');
      
      const existingModule = await moduleRepository.findById(id);
      if (!existingModule) {
        return reply.status(404).send({
          success: false,
          message: 'Module not found'
        });
      }

      await moduleRepository.delete(id);

      reply.send({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete module'
      });
    }
  }
}
