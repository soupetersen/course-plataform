import { Module } from '../../src/models/Module';

describe('Module', () => {
  describe('constructor', () => {
    it('should create a module with all required properties', () => {
      const moduleData = {
        id: 'module-1',
        title: 'Introduction to TypeScript',
        description: 'Learn the basics of TypeScript',
        order: 1,
        courseId: 'course-1',
      };

      const module = new Module(moduleData);

      expect(module.id).toBe(moduleData.id);
      expect(module.title).toBe(moduleData.title);
      expect(module.description).toBe(moduleData.description);
      expect(module.order).toBe(moduleData.order);
      expect(module.courseId).toBe(moduleData.courseId);
      expect(module.isLocked).toBe(false);
      expect(module.createdAt).toBeInstanceOf(Date);
      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a module without description', () => {
      const moduleData = {
        id: 'module-1',
        title: 'Introduction to TypeScript',
        order: 1,
        courseId: 'course-1',
      };

      const module = new Module(moduleData);

      expect(module.description).toBeUndefined();
    });

    it('should create a locked module when isLocked is true', () => {
      const moduleData = {
        id: 'module-1',
        title: 'Advanced TypeScript',
        order: 2,
        isLocked: true,
        courseId: 'course-1',
      };

      const module = new Module(moduleData);

      expect(module.isLocked).toBe(true);
    });

    it('should use provided dates when specified', () => {
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');

      const moduleData = {
        id: 'module-1',
        title: 'Introduction to TypeScript',
        order: 1,
        courseId: 'course-1',
        createdAt,
        updatedAt,
      };

      const module = new Module(moduleData);

      expect(module.createdAt).toBe(createdAt);
      expect(module.updatedAt).toBe(updatedAt);
    });
  });

  describe('create', () => {
    it('should create a new module with generated ID and dates', () => {
      const moduleData = {
        title: 'JavaScript Fundamentals',
        description: 'Learn JavaScript basics',
        order: 1,
        courseId: 'course-1',
      };

      const module = Module.create(moduleData);

      expect(module.id).toBeDefined();
      expect(module.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(module.title).toBe(moduleData.title);
      expect(module.description).toBe(moduleData.description);
      expect(module.order).toBe(moduleData.order);
      expect(module.courseId).toBe(moduleData.courseId);
      expect(module.isLocked).toBe(false);
      expect(module.createdAt).toBeInstanceOf(Date);
      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a locked module when isLocked is true', () => {
      const moduleData = {
        title: 'Advanced Concepts',
        order: 3,
        courseId: 'course-1',
        isLocked: true,
      };

      const module = Module.create(moduleData);

      expect(module.isLocked).toBe(true);
    });

    it('should create a module without description', () => {
      const moduleData = {
        title: 'Quick Overview',
        order: 1,
        courseId: 'course-1',
      };

      const module = Module.create(moduleData);

      expect(module.description).toBeUndefined();
    });
  });

  describe('update', () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create({
        title: 'Original Title',
        description: 'Original description',
        order: 1,
        courseId: 'course-1',
        isLocked: false,
      });
    });

    it('should update title', () => {
      const newTitle = 'Updated Title';
      const originalUpdatedAt = module.updatedAt;

      setTimeout(() => {
        module.update({ title: newTitle });

        expect(module.title).toBe(newTitle);
        expect(module.updatedAt).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('should update description', () => {
      const newDescription = 'Updated description';
      const originalUpdatedAt = module.updatedAt;

      setTimeout(() => {
        module.update({ description: newDescription });

        expect(module.description).toBe(newDescription);
        expect(module.updatedAt).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('should update order', () => {
      const newOrder = 5;
      const originalUpdatedAt = module.updatedAt;

      setTimeout(() => {
        module.update({ order: newOrder });

        expect(module.order).toBe(newOrder);
        expect(module.updatedAt).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('should update isLocked status', () => {
      const originalUpdatedAt = module.updatedAt;

      setTimeout(() => {
        module.update({ isLocked: true });

        expect(module.isLocked).toBe(true);
        expect(module.updatedAt).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('should update multiple fields at once', () => {
      const updates = {
        title: 'New Title',
        description: 'New description',
        order: 10,
        isLocked: true,
      };
      const originalUpdatedAt = module.updatedAt;

      setTimeout(() => {
        module.update(updates);

        expect(module.title).toBe(updates.title);
        expect(module.description).toBe(updates.description);
        expect(module.order).toBe(updates.order);
        expect(module.isLocked).toBe(updates.isLocked);
        expect(module.updatedAt).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('should not change fields when undefined values are provided', () => {
      const originalTitle = module.title;
      const originalDescription = module.description;
      const originalOrder = module.order;
      const originalIsLocked = module.isLocked;

      module.update({});

      expect(module.title).toBe(originalTitle);
      expect(module.description).toBe(originalDescription);
      expect(module.order).toBe(originalOrder);
      expect(module.isLocked).toBe(originalIsLocked);
    });
  });
});
