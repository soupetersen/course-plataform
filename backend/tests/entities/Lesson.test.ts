import { Lesson, LessonType } from '../../src/models/Lesson';

describe('Lesson', () => {
  describe('constructor', () => {
    it('should create a lesson with all required properties', () => {
      const lessonData = {
        id: 'lesson-1',
        title: 'Introduction to Variables',
        content: 'Learn about variables in programming',
        description: 'A comprehensive guide to variables',
        videoUrl: 'https://example.com/video.mp4',
        duration: 300,
        order: 1,
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'VIDEO' as LessonType,
      };

      const lesson = new Lesson(lessonData);

      expect(lesson.id).toBe(lessonData.id);
      expect(lesson.title).toBe(lessonData.title);
      expect(lesson.content).toBe(lessonData.content);
      expect(lesson.description).toBe(lessonData.description);
      expect(lesson.videoUrl).toBe(lessonData.videoUrl);
      expect(lesson.duration).toBe(lessonData.duration);
      expect(lesson.order).toBe(lessonData.order);
      expect(lesson.moduleId).toBe(lessonData.moduleId);
      expect(lesson.courseId).toBe(lessonData.courseId);
      expect(lesson.type).toBe(lessonData.type);
      expect(lesson.isPreview).toBe(false);
      expect(lesson.isLocked).toBe(false);
      expect(lesson.isCompleted).toBe(false);
      expect(lesson.createdAt).toBeInstanceOf(Date);
      expect(lesson.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a lesson with minimal required properties', () => {
      const lessonData = {
        id: 'lesson-1',
        title: 'Basic Lesson',
        content: 'Simple content',
        order: 1,
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'TEXT' as LessonType,
      };

      const lesson = new Lesson(lessonData);

      expect(lesson.description).toBeUndefined();
      expect(lesson.videoUrl).toBeUndefined();
      expect(lesson.duration).toBeUndefined();
    });

    it('should create a preview lesson when isPreview is true', () => {
      const lessonData = {
        id: 'lesson-1',
        title: 'Preview Lesson',
        content: 'Preview content',
        order: 1,
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'VIDEO' as LessonType,
        isPreview: true,
      };

      const lesson = new Lesson(lessonData);

      expect(lesson.isPreview).toBe(true);
    });

    it('should create a locked lesson when isLocked is true', () => {
      const lessonData = {
        id: 'lesson-1',
        title: 'Locked Lesson',
        content: 'Locked content',
        order: 1,
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'QUIZ' as LessonType,
        isLocked: true,
      };

      const lesson = new Lesson(lessonData);

      expect(lesson.isLocked).toBe(true);
    });

    it('should use provided dates when specified', () => {
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');

      const lessonData = {
        id: 'lesson-1',
        title: 'Lesson with Dates',
        content: 'Content',
        order: 1,
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'TEXT' as LessonType,
        createdAt,
        updatedAt,
      };

      const lesson = new Lesson(lessonData);

      expect(lesson.createdAt).toBe(createdAt);
      expect(lesson.updatedAt).toBe(updatedAt);
    });
  });

  describe('create', () => {
    it('should create a new lesson with generated ID and dates', () => {
      const lessonData = {
        title: 'New Lesson',
        content: 'Lesson content',
        description: 'Lesson description',
        videoUrl: 'https://example.com/video.mp4',
        duration: 600,
        order: 2,
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'VIDEO' as LessonType,
      };

      const lesson = Lesson.create(lessonData);

      expect(lesson.id).toBeDefined();
      expect(lesson.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(lesson.title).toBe(lessonData.title);
      expect(lesson.content).toBe(lessonData.content);
      expect(lesson.description).toBe(lessonData.description);
      expect(lesson.videoUrl).toBe(lessonData.videoUrl);
      expect(lesson.duration).toBe(lessonData.duration);
      expect(lesson.order).toBe(lessonData.order);
      expect(lesson.moduleId).toBe(lessonData.moduleId);
      expect(lesson.courseId).toBe(lessonData.courseId);
      expect(lesson.type).toBe(lessonData.type);
      expect(lesson.isPreview).toBe(false);
      expect(lesson.isLocked).toBe(false);
      expect(lesson.isCompleted).toBe(false);
      expect(lesson.createdAt).toBeInstanceOf(Date);
      expect(lesson.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a lesson with default order when not provided', () => {
      const lessonData = {
        title: 'Default Order Lesson',
        content: 'Content',
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'TEXT' as LessonType,
      };

      const lesson = Lesson.create(lessonData);

      expect(lesson.order).toBe(0);
    });

    it('should create a preview lesson when isPreview is true', () => {
      const lessonData = {
        title: 'Preview Lesson',
        content: 'Preview content',
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'VIDEO' as LessonType,
        isPreview: true,
      };

      const lesson = Lesson.create(lessonData);

      expect(lesson.isPreview).toBe(true);
    });

    it('should create lesson with all lesson types', () => {
      const types: LessonType[] = ['VIDEO', 'TEXT', 'QUIZ'];

      types.forEach(type => {
        const lesson = Lesson.create({
          title: `${type} Lesson`,
          content: `${type} content`,
          moduleId: 'module-1',
          courseId: 'course-1',
          type,
        });

        expect(lesson.type).toBe(type);
      });
    });
  });

  describe('update', () => {
    let lesson: Lesson;

    beforeEach(() => {
      lesson = Lesson.create({
        title: 'Original Title',
        content: 'Original content',
        description: 'Original description',
        videoUrl: 'https://example.com/original.mp4',
        duration: 300,
        order: 1,
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'VIDEO',
        isPreview: false,
        isLocked: false,
      });
    });

    it('should update title', async () => {
      const newTitle = 'Updated Title';
      const originalUpdatedAt = lesson.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));
      
      lesson.update({ title: newTitle });

      expect(lesson.title).toBe(newTitle);
      expect(lesson.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should update content', async () => {
      const newContent = 'Updated content';
      const originalUpdatedAt = lesson.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));
      
      lesson.update({ content: newContent });

      expect(lesson.content).toBe(newContent);
      expect(lesson.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should update description', () => {
      const newDescription = 'Updated description';
      
      lesson.update({ description: newDescription });

      expect(lesson.description).toBe(newDescription);
    });

    it('should update videoUrl', () => {
      const newVideoUrl = 'https://example.com/updated.mp4';
      
      lesson.update({ videoUrl: newVideoUrl });

      expect(lesson.videoUrl).toBe(newVideoUrl);
    });

    it('should update duration', () => {
      const newDuration = 600;
      
      lesson.update({ duration: newDuration });

      expect(lesson.duration).toBe(newDuration);
    });

    it('should update order', () => {
      const newOrder = 5;
      
      lesson.update({ order: newOrder });

      expect(lesson.order).toBe(newOrder);
    });

    it('should update type', () => {
      const newType: LessonType = 'QUIZ';
      
      lesson.update({ type: newType });

      expect(lesson.type).toBe(newType);
    });

    it('should update isPreview', () => {
      lesson.update({ isPreview: true });

      expect(lesson.isPreview).toBe(true);
    });

    it('should update isLocked', () => {
      lesson.update({ isLocked: true });

      expect(lesson.isLocked).toBe(true);
    });

    it('should update multiple fields at once', () => {
      const updates = {
        title: 'New Title',
        content: 'New content',
        duration: 900,
        type: 'TEXT' as LessonType,
        isPreview: true,
      };

      lesson.update(updates);

      expect(lesson.title).toBe(updates.title);
      expect(lesson.content).toBe(updates.content);
      expect(lesson.duration).toBe(updates.duration);
      expect(lesson.type).toBe(updates.type);
      expect(lesson.isPreview).toBe(updates.isPreview);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark lesson as completed', async () => {
      const lesson = Lesson.create({
        title: 'Test Lesson',
        content: 'Test content',
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'VIDEO',
      });

      const originalUpdatedAt = lesson.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));
      
      lesson.markAsCompleted();

      expect(lesson.isCompleted).toBe(true);
      expect(lesson.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should update updatedAt when marking as completed', async () => {
      const lesson = Lesson.create({
        title: 'Test Lesson',
        content: 'Test content',
        moduleId: 'module-1',
        courseId: 'course-1',
        type: 'VIDEO',
      });

      const originalUpdatedAt = lesson.updatedAt;

      // Wait a small amount to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      lesson.markAsCompleted();

      expect(lesson.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
