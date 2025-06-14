import { randomUUID } from 'crypto';

export class Enrollment {
  constructor(
    public id: string,
    public userId: string,
    public courseId: string,
    public enrolledAt: Date,
    public completedAt?: Date,
    public progress: number = 0,
    public isActive: boolean = true,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  static create(data: {
    userId: string;
    courseId: string;
  }): Enrollment {
    return new Enrollment(
      randomUUID(),
      data.userId,
      data.courseId,
      new Date(),
      undefined,
      0,
      true,
      new Date(),
      new Date()
    );
  }

  updateProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(100, progress));
    this.updatedAt = new Date();
    
    if (this.progress >= 100) {
      this.complete();
    }
  }

  complete(): void {
    this.completedAt = new Date();
    this.progress = 100;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  reactivate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  isCompleted(): boolean {
    return this.completedAt !== undefined && this.progress >= 100;
  }
}
