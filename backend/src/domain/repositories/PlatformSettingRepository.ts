import { PlatformSetting } from '../models/PlatformSetting';

export interface PlatformSettingRepository {
  create(setting: PlatformSetting): Promise<PlatformSetting>;
  findById(id: string): Promise<PlatformSetting | null>;
  findByKey(key: string): Promise<PlatformSetting | null>;
  findAll(): Promise<PlatformSetting[]>;
  update(key: string, value: string): Promise<PlatformSetting>;
  delete(key: string): Promise<void>;
  upsert(setting: PlatformSetting): Promise<PlatformSetting>;
}
