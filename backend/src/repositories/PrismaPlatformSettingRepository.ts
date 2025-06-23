import { PrismaClient } from '@prisma/client';
import { PlatformSettingRepository } from '../interfaces/PlatformSettingRepository';
import { PlatformSetting } from '../models/PlatformSetting';

export class PrismaPlatformSettingRepository implements PlatformSettingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(setting: PlatformSetting): Promise<PlatformSetting> {
    const created = await this.prisma.platformSetting.create({
      data: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
        updatedBy: setting.id || 'system',
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<PlatformSetting | null> {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { id },
    });

    return setting ? this.toDomain(setting) : null;
  }

  async findByKey(key: string): Promise<PlatformSetting | null> {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key },
    });

    return setting ? this.toDomain(setting) : null;
  }

  async findAll(): Promise<PlatformSetting[]> {
    const settings = await this.prisma.platformSetting.findMany({
      orderBy: { key: 'asc' },
    });

    return settings.map(this.toDomain);
  }

  async update(key: string, value: string): Promise<PlatformSetting> {
    const updated = await this.prisma.platformSetting.update({
      where: { key },
      data: {
        value,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async delete(key: string): Promise<void> {
    await this.prisma.platformSetting.delete({
      where: { key },
    });
  }

  async upsert(setting: PlatformSetting): Promise<PlatformSetting> {
    const upserted = await this.prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        type: setting.type,
        description: setting.description,
        updatedBy: setting.updatedBy,
        updatedAt: new Date(),
      },
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
        updatedBy: setting.updatedBy,
      },
    });

    return this.toDomain(upserted);
  }

  private toDomain(prismaData: any): PlatformSetting {
    return new PlatformSetting(
      prismaData.id,
      prismaData.key,
      prismaData.value,
      prismaData.type,
      prismaData.description,
      prismaData.updatedBy,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }
}
