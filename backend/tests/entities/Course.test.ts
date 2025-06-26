import { Course, CourseStatus, CourseLevel } from '../../src/models/Course';

describe('Course Entity', () => {
  describe('constructor', () => {
    it('should create a course with all required properties', () => {
      const courseData = {
        id: 'test-course-id',
        title: 'Test Course',
        description: 'Test Description',
        content: 'Course content',
        imageUrl: 'imageUrl.jpg',
        price: 99.99,
        duration: 120,
        level: 'BEGINNER' as CourseLevel,
        status: 'PUBLISHED' as CourseStatus,
        isActive: true,
        instructorId: 'instructor-id',
        categoryId: 'category-id',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const course = new Course(courseData);

      expect(course.id).toBe(courseData.id);
      expect(course.title).toBe(courseData.title);
      expect(course.description).toBe(courseData.description);
      expect(course.content).toBe(courseData.content);
      expect(course.imageUrl).toBe(courseData.imageUrl);
      expect(course.price).toBe(courseData.price);
      expect(course.duration).toBe(courseData.duration);
      expect(course.level).toBe(courseData.level);
      expect(course.status).toBe(courseData.status);
      expect(course.isActive).toBe(courseData.isActive);
      expect(course.instructorId).toBe(courseData.instructorId);
      expect(course.categoryId).toBe(courseData.categoryId);
      expect(course.createdAt).toBe(courseData.createdAt);
      expect(course.updatedAt).toBe(courseData.updatedAt);
    });

    it('should set default values for optional properties', () => {
      const courseData = {
        id: 'test-course-id',
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        duration: 120,
        level: 'INTERMEDIATE' as CourseLevel,
        status: 'DRAFT' as CourseStatus,
        instructorId: 'instructor-id',
        categoryId: 'category-id'
      };

      const course = new Course(courseData);

      expect(course.isActive).toBe(true);
      expect(course.content).toBeUndefined();
      expect(course.imageUrl).toBeUndefined();
      expect(course.createdAt).toBeInstanceOf(Date);
      expect(course.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('create static method', () => {
    it('should create a course with generated ID and default status', () => {
      const courseData = {
        title: 'New Course',
        description: 'Course Description',
        content: 'Course content',
        imageUrl: 'imageUrl.jpg',
        price: 199.99,
        duration: 240,
        level: 'ADVANCED' as CourseLevel,
        instructorId: 'instructor-id',
        categoryId: 'category-id'
      };

      const course = Course.create(courseData);

      expect(course.id).toBeDefined();
      expect(course.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(course.title).toBe(courseData.title);
      expect(course.description).toBe(courseData.description);
      expect(course.content).toBe(courseData.content);
      expect(course.imageUrl).toBe(courseData.imageUrl);
      expect(course.price).toBe(courseData.price);
      expect(course.duration).toBe(courseData.duration);
      expect(course.level).toBe(courseData.level);
      expect(course.status).toBe('DRAFT');
      expect(course.isActive).toBe(true);
      expect(course.instructorId).toBe(courseData.instructorId);
      expect(course.categoryId).toBe(courseData.categoryId);
      expect(course.createdAt).toBeInstanceOf(Date);
      expect(course.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a course without optional fields', () => {
      const courseData = {
        title: 'Basic Course',
        description: 'Basic Description',
        price: 49.99,
        duration: 60,
        level: 'BEGINNER' as CourseLevel,
        instructorId: 'instructor-id',
        categoryId: 'category-id'
      };

      const course = Course.create(courseData);

      expect(course.content).toBeUndefined();
      expect(course.imageUrl).toBeUndefined();
      expect(course.status).toBe('DRAFT');
    });

    it('should handle all course levels', () => {
      const levels: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

      levels.forEach(level => {
        const courseData = {
          title: 'Test Course',
          description: 'Test Description',
          price: 99.99,
          duration: 120,
          level,
          instructorId: 'instructor-id',
          categoryId: 'category-id'
        };

        const course = Course.create(courseData);
        expect(course.level).toBe(level);
      });
    });
  });

  describe('update method', () => {
    let course: Course;

    beforeEach(() => {
      course = Course.create({
        title: 'Original Title',
        description: 'Original Description',
        price: 99.99,
        duration: 120,
        level: 'BEGINNER',
        instructorId: 'instructor-id',
        categoryId: 'category-id'
      });
    });

    it('should update title', async () => {
      const newTitle = 'Updated Title';
      const originalUpdatedAt = course.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1));
      
      course.update({ title: newTitle });

      expect(course.title).toBe(newTitle);
      expect(course.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should update multiple properties', () => {
      const updates = {
        title: 'New Title',
        description: 'New Description',
        price: 149.99,
        duration: 180,
        level: 'ADVANCED' as CourseLevel
      };

      course.update(updates);

      expect(course.title).toBe(updates.title);
      expect(course.description).toBe(updates.description);
      expect(course.price).toBe(updates.price);
      expect(course.duration).toBe(updates.duration);
      expect(course.level).toBe(updates.level);
    });

    it('should not update undefined properties', () => {
      const originalTitle = course.title;
      const originalPrice = course.price;

      course.update({ description: 'New Description' });

      expect(course.title).toBe(originalTitle);
      expect(course.price).toBe(originalPrice);
      expect(course.description).toBe('New Description');
    });

    it('should update content and imageUrl', () => {
      const updates = {
        content: 'New content',
        imageUrl: 'new-imageUrl.jpg'
      };

      course.update(updates);

      expect(course.content).toBe(updates.content);
      expect(course.imageUrl).toBe(updates.imageUrl);
    });
  });

  describe('publish method', () => {
    it('should change status to PUBLISHED', async () => {
      const course = Course.create({
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        duration: 120,
        level: 'BEGINNER',
        instructorId: 'instructor-id',
        categoryId: 'category-id'
      });

      const originalUpdatedAt = course.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 1));
      
      course.publish();

      expect(course.status).toBe('PUBLISHED');
      expect(course.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('archive method', () => {
    it('should change status to ARCHIVED', async () => {
      const course = Course.create({
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        duration: 120,
        level: 'BEGINNER',
        instructorId: 'instructor-id',
        categoryId: 'category-id'
      });

      const originalUpdatedAt = course.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 1));
      
      course.archive();

      expect(course.status).toBe('ARCHIVED');
      expect(course.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
