import { FastifyRequest, FastifyReply } from 'fastify';
import { PlatformSettingRepository } from '@/interfaces/PlatformSettingRepository';
import { PlatformSetting } from '@/models/PlatformSetting';

export class AdminPlatformSettingsController {
  constructor(private platformSettingRepository: PlatformSettingRepository) {}

  async getSettings(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const settings = await this.platformSettingRepository.findAll();

      reply.status(200).send({
        success: true,
        data: {
          settings: settings.map((setting: PlatformSetting) => ({
            id: setting.id,
            key: setting.key,
            value: setting.value,
            type: setting.type,
            description: setting.description,
            updatedBy: setting.updatedBy,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt
          }))
        }
      });
    } catch (error) {
      req.log.error('Error fetching platform settings:', error);
      reply.status(500).send({
        success: false,
        error: 'Falha ao buscar configurações da plataforma'
      });
    }
  }

  async getSetting(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { key } = req.params as { key: string };

      const setting = await this.platformSettingRepository.findByKey(key);

      if (!setting) {
        reply.status(404).send({
          success: false,
          error: 'Configuração não encontrada'
        });
        return;
      }

      reply.status(200).send({
        success: true,
        data: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          description: setting.description,
          updatedAt: setting.updatedAt
        }
      });
    } catch (error) {
      req.log.error('Error fetching platform setting:', error);
      reply.status(500).send({
        success: false,
        error: 'Falha ao buscar configuração da plataforma'
      });
    }
  }

  async updateSetting(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { key } = req.params as { key: string };
      const { value } = req.body as { value: string };
      const userInfo = (req as any).userInfo;

      if (!value && value !== '0' && value !== 'false') {
        reply.status(400).send({
          success: false,
          error: 'Valor é obrigatório'
        });
        return;
      }

      const existingSetting = await this.platformSettingRepository.findByKey(key);
      if (!existingSetting) {
        reply.status(404).send({
          success: false,
          error: 'Configuração não encontrada'
        });
        return;
      }

      if (existingSetting.type === 'NUMBER') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          reply.status(400).send({
            success: false,
            error: 'Valor numérico inválido'
          });
          return;
        }

        if (key === 'PLATFORM_FEE_PERCENTAGE' && (numValue < 0 || numValue > 100)) {
          reply.status(400).send({
            success: false,
            error: 'Porcentagem da taxa da plataforma deve estar entre 0 e 100'
          });
          return;
        }

        if (key === 'STRIPE_FEE_PERCENTAGE' && (numValue < 0 || numValue > 10)) {
          reply.status(400).send({
            success: false,
            error: 'Porcentagem da taxa do Stripe deve estar entre 0 e 10'
          });
          return;
        }

        if (key === 'REFUND_DAYS_LIMIT' && (numValue < 0 || numValue > 365)) {
          reply.status(400).send({
            success: false,
            error: 'Limite de dias para reembolso deve estar entre 0 e 365'
          });
          return;
        }

        if (key === 'MINIMUM_PAYOUT_AMOUNT' && (numValue < 0 || numValue > 10000)) {
          reply.status(400).send({
            success: false,
            error: 'Valor mínimo de saque deve estar entre 0 e 10000'
          });
          return;
        }
      }

      if (existingSetting.type === 'BOOLEAN') {
        const lowerValue = value.toLowerCase();
        if (lowerValue !== 'true' && lowerValue !== 'false') {
          reply.status(400).send({
            success: false,
            error: 'Valor booleano deve ser "true" ou "false"'
          });
          return;
        }
      }

      req.log.info({
        action: 'UPDATE_PLATFORM_SETTING',
        key: key,
        oldValue: existingSetting.value,
        newValue: value,
        userId: userInfo.userId,
        userEmail: userInfo.email,
        timestamp: new Date().toISOString()
      });

      const updatedSetting = await this.platformSettingRepository.update(key, value);

      reply.status(200).send({
        success: true,
        data: {
          id: updatedSetting.id,
          key: updatedSetting.key,
          value: updatedSetting.value,
          type: updatedSetting.type,
          description: updatedSetting.description,
          updatedBy: updatedSetting.updatedBy,
          createdAt: updatedSetting.createdAt,
          updatedAt: updatedSetting.updatedAt
        },
        message: 'Configuração atualizada com sucesso'
      });
    } catch (error) {
      req.log.error('Error updating platform setting:', error);
      reply.status(500).send({
        success: false,
        error: 'Falha ao atualizar configuração da plataforma'
      });
    }
  }

  async createSetting(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { 
        key, 
        value, 
        type, 
        description 
      } = req.body as {
        key: string;
        value: string;
        type: 'STRING' | 'NUMBER' | 'BOOLEAN';
        description?: string;
      };

      const userInfo = (req as any).userInfo;

      if (!key || !value || !type) {
        reply.status(400).send({
          success: false,
          error: 'Chave, valor e tipo são obrigatórios'
        });
        return;
      }

      const existingSetting = await this.platformSettingRepository.findByKey(key);
      if (existingSetting) {
        reply.status(400).send({
          success: false,
          error: 'Configuração com esta chave já existe'
        });
        return;
      }

      if (type === 'NUMBER') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          reply.status(400).send({
            success: false,
            error: 'Valor numérico inválido'
          });
          return;
        }
      }

      if (type === 'BOOLEAN') {
        const lowerValue = value.toLowerCase();
        if (lowerValue !== 'true' && lowerValue !== 'false') {
          reply.status(400).send({
            success: false,
            error: 'Valor booleano deve ser "true" ou "false"'
          });
          return;
        }
      }

      const setting = PlatformSetting.create({
        key,
        value,
        type,
        description,
        updatedBy: userInfo.userId
      });

      const createdSetting = await this.platformSettingRepository.create(setting);

      reply.status(201).send({
        success: true,
        data: {
          key: createdSetting.key,
          value: createdSetting.value,
          type: createdSetting.type,
          description: createdSetting.description,
          createdAt: createdSetting.createdAt
        },
        message: 'Configuração criada com sucesso'
      });
    } catch (error) {
      req.log.error('Error creating platform setting:', error);
      reply.status(500).send({
        success: false,
        error: 'Falha ao criar configuração da plataforma'
      });
    }
  }
}
