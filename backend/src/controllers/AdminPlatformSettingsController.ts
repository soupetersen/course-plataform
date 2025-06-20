import { FastifyRequest, FastifyReply } from 'fastify';
import { PlatformSettingRepository } from '@/domain/repositories/PlatformSettingRepository';
import { PlatformSetting } from '@/domain/models/PlatformSetting';

export class AdminPlatformSettingsController {
  constructor(private platformSettingRepository: PlatformSettingRepository) {}

  async getSettings(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const settings = await this.platformSettingRepository.findAll();

      reply.status(200).send({
        success: true,
        data: {
          settings: settings.map(setting => ({
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
        error: 'Failed to fetch platform settings'
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
          error: 'Setting not found'
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
        error: 'Failed to fetch platform setting'
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
          error: 'Value is required'
        });
        return;
      }

      const existingSetting = await this.platformSettingRepository.findByKey(key);
      if (!existingSetting) {
        reply.status(404).send({
          success: false,
          error: 'Setting not found'
        });
        return;
      }

      if (existingSetting.type === 'NUMBER') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          reply.status(400).send({
            success: false,
            error: 'Invalid number value'
          });
          return;
        }

        if (key === 'PLATFORM_FEE_PERCENTAGE' && (numValue < 0 || numValue > 100)) {
          reply.status(400).send({
            success: false,
            error: 'Platform fee percentage must be between 0 and 100'
          });
          return;
        }

        if (key === 'STRIPE_FEE_PERCENTAGE' && (numValue < 0 || numValue > 10)) {
          reply.status(400).send({
            success: false,
            error: 'Stripe fee percentage must be between 0 and 10'
          });
          return;
        }

        if (key === 'REFUND_DAYS_LIMIT' && (numValue < 0 || numValue > 365)) {
          reply.status(400).send({
            success: false,
            error: 'Refund days limit must be between 0 and 365'
          });
          return;
        }

        if (key === 'MINIMUM_PAYOUT_AMOUNT' && (numValue < 0 || numValue > 10000)) {
          reply.status(400).send({
            success: false,
            error: 'Minimum payout amount must be between 0 and 10000'
          });
          return;
        }
      }

      if (existingSetting.type === 'BOOLEAN') {
        const lowerValue = value.toLowerCase();
        if (lowerValue !== 'true' && lowerValue !== 'false') {
          reply.status(400).send({
            success: false,
            error: 'Boolean value must be "true" or "false"'
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
        message: 'Setting updated successfully'
      });
    } catch (error) {
      req.log.error('Error updating platform setting:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to update platform setting'
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

      if (!key || !value || !type) {
        reply.status(400).send({
          success: false,
          error: 'Key, value, and type are required'
        });
        return;
      }

      const existingSetting = await this.platformSettingRepository.findByKey(key);
      if (existingSetting) {
        reply.status(400).send({
          success: false,
          error: 'Setting with this key already exists'
        });
        return;
      }

      if (type === 'NUMBER') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          reply.status(400).send({
            success: false,
            error: 'Invalid number value'
          });
          return;
        }
      }

      if (type === 'BOOLEAN') {
        const lowerValue = value.toLowerCase();
        if (lowerValue !== 'true' && lowerValue !== 'false') {
          reply.status(400).send({
            success: false,
            error: 'Boolean value must be "true" or "false"'
          });
          return;
        }
      }

      const setting = PlatformSetting.create({
        key,
        value,
        type,
        description,
        updatedBy: (req as any).user.id
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
        message: 'Setting created successfully'
      });
    } catch (error) {
      req.log.error('Error creating platform setting:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to create platform setting'
      });
    }
  }
}
