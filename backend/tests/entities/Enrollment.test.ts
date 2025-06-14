import { Enrollment } from '../../src/models/Enrollment';

describe('Enrollment', () => {
  describe('constructor', () => {
    it('should create an enrollment with all required properties', () => {
      const enrollmentData = {
        id: 'enrollment-1',
        userId: 'user-1',
        courseId: 'course-1',
        enrolledAt: new Date('2023-01-01'),
        completedAt: new Date('2023-01-15'),
        progress: 75,
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const enrollment = new Enrollment(
        enrollmentData.id,
        enrollmentData.userId,
        enrollmentData.courseId,
        enrollmentData.enrolledAt,
        enrollmentData.completedAt,
        enrollmentData.progress,
        enrollmentData.isActive,
        enrollmentData.createdAt,
        enrollmentData.updatedAt
      );

      expect(enrollment.id).toBe(enrollmentData.id);
      expect(enrollment.userId).toBe(enrollmentData.userId);
      expect(enrollment.courseId).toBe(enrollmentData.courseId);
      expect(enrollment.enrolledAt).toBe(enrollmentData.enrolledAt);
      expect(enrollment.completedAt).toBe(enrollmentData.completedAt);
      expect(enrollment.progress).toBe(enrollmentData.progress);
      expect(enrollment.isActive).toBe(enrollmentData.isActive);
      expect(enrollment.createdAt).toBe(enrollmentData.createdAt);
      expect(enrollment.updatedAt).toBe(enrollmentData.updatedAt);
    });

    it('should create an enrollment with default values', () => {
      const enrollment = new Enrollment(
        'enrollment-1',
        'user-1',
        'course-1',
        new Date('2023-01-01')
      );

      expect(enrollment.completedAt).toBeUndefined();
      expect(enrollment.progress).toBe(0);
      expect(enrollment.isActive).toBe(true);
    });
  });

  describe('create', () => {
    it('should create a new enrollment with generated ID and dates', () => {
      const enrollmentData = {
        userId: 'user-1',
        courseId: 'course-1'
      };

      const enrollment = Enrollment.create(enrollmentData);

      expect(enrollment.id).toBeDefined();
      expect(enrollment.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(enrollment.userId).toBe(enrollmentData.userId);
      expect(enrollment.courseId).toBe(enrollmentData.courseId);
      expect(enrollment.enrolledAt).toBeInstanceOf(Date);
      expect(enrollment.completedAt).toBeUndefined();
      expect(enrollment.progress).toBe(0);
      expect(enrollment.isActive).toBe(true);
      expect(enrollment.createdAt).toBeInstanceOf(Date);
      expect(enrollment.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateProgress', () => {
    let enrollment: Enrollment;

    beforeEach(() => {
      enrollment = Enrollment.create({
        userId: 'user-1',
        courseId: 'course-1'
      });
    });

    it('should update progress to a valid value', async () => {
      const newProgress = 50;
      const originalUpdatedAt = enrollment.updatedAt!;

      await new Promise(resolve => setTimeout(resolve, 1));
      
      enrollment.updateProgress(newProgress);

      expect(enrollment.progress).toBe(newProgress);
      expect(enrollment.updatedAt!.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should clamp progress to 0 minimum', () => {
      enrollment.updateProgress(-10);

      expect(enrollment.progress).toBe(0);
    });

    it('should clamp progress to 100 maximum', () => {
      enrollment.updateProgress(150);

      expect(enrollment.progress).toBe(100);
    });

    it('should complete enrollment when progress reaches 100', () => {
      enrollment.updateProgress(100);

      expect(enrollment.progress).toBe(100);
      expect(enrollment.completedAt).toBeInstanceOf(Date);
    });

    it('should complete enrollment when progress exceeds 100', () => {
      enrollment.updateProgress(120);

      expect(enrollment.progress).toBe(100);
      expect(enrollment.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('complete', () => {
    it('should mark enrollment as completed', async () => {
      const enrollment = Enrollment.create({
        userId: 'user-1',
        courseId: 'course-1'
      });

      const originalUpdatedAt = enrollment.updatedAt!;

      await new Promise(resolve => setTimeout(resolve, 1));
      
      enrollment.complete();

      expect(enrollment.completedAt).toBeInstanceOf(Date);
      expect(enrollment.progress).toBe(100);
      expect(enrollment.updatedAt!.getTime()).toBeGreaterThan(originalUpdatedAt!.getTime());
    });

    it('should update completedAt when called multiple times', async () => {
      const enrollment = Enrollment.create({
        userId: 'user-1',
        courseId: 'course-1'
      });

      enrollment.complete();
      const firstCompletedAt = enrollment.completedAt;

      await new Promise(resolve => setTimeout(resolve, 1));
      
      enrollment.complete();

      expect(enrollment.completedAt?.getTime()).toBeGreaterThan(firstCompletedAt!.getTime());
    });
  });

  describe('deactivate', () => {
    it('should mark enrollment as inactive', async () => {
      const enrollment = Enrollment.create({
        userId: 'user-1',
        courseId: 'course-1'
      });

      const originalUpdatedAt = enrollment.updatedAt!;

      await new Promise(resolve => setTimeout(resolve, 1));
      
      enrollment.deactivate();

      expect(enrollment.isActive).toBe(false);
      expect(enrollment.updatedAt!.getTime()).toBeGreaterThan(originalUpdatedAt!.getTime());
    });
  });

  describe('reactivate', () => {
    it('should mark enrollment as active', async () => {
      const enrollment = Enrollment.create({
        userId: 'user-1',
        courseId: 'course-1'
      });

      enrollment.deactivate();
      const originalUpdatedAt = enrollment.updatedAt!;

      await new Promise(resolve => setTimeout(resolve, 1));
      
      enrollment.reactivate();

      expect(enrollment.isActive).toBe(true);
      expect(enrollment.updatedAt!.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('isCompleted', () => {
    it('should return true when enrollment is completed', () => {
      const enrollment = Enrollment.create({
        userId: 'user-1',
        courseId: 'course-1'
      });

      enrollment.complete();

      expect(enrollment.isCompleted()).toBe(true);
    });

    it('should return false when enrollment is not completed', () => {
      const enrollment = Enrollment.create({
        userId: 'user-1',
        courseId: 'course-1'
      });

      expect(enrollment.isCompleted()).toBe(false);
    });

    it('should return false when completedAt is set but progress is not 100', () => {
      const enrollment = new Enrollment(
        'enrollment-1',
        'user-1',
        'course-1',
        new Date(),
        new Date(),
        50
      );

      expect(enrollment.isCompleted()).toBe(false);
    });

    it('should return false when progress is 100 but completedAt is not set', () => {
      const enrollment = new Enrollment(
        'enrollment-1',
        'user-1',
        'course-1',
        new Date(),
        undefined,
        100
      );

      expect(enrollment.isCompleted()).toBe(false);
    });
  });
});
