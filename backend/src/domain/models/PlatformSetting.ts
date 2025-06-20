export class PlatformSetting {
  constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly value: string,
    public readonly type: 'STRING' | 'NUMBER' | 'BOOLEAN',
    public readonly description: string | null,
    public readonly updatedBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: {
    key: string;
    value: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN';
    description?: string | null;
    updatedBy: string;
  }): PlatformSetting {
    return new PlatformSetting(
      '',
      data.key,
      data.value,
      data.type,
      data.description || null,
      data.updatedBy,
      new Date(),
      new Date()
    );
  }

  getValueAsString(): string {
    return this.value;
  }

  getValueAsNumber(): number {
    if (this.type !== 'NUMBER') {
      throw new Error(`Setting ${this.key} is not a number type`);
    }
    return parseFloat(this.value);
  }

  getValueAsBoolean(): boolean {
    if (this.type !== 'BOOLEAN') {
      throw new Error(`Setting ${this.key} is not a boolean type`);
    }
    return this.value.toLowerCase() === 'true';
  }

  updateValue(newValue: string, updatedBy: string): PlatformSetting {
    return new PlatformSetting(
      this.id,
      this.key,
      newValue,
      this.type,
      this.description,
      updatedBy,
      this.createdAt,
      new Date()
    );
  }
}
