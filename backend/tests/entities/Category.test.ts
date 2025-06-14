import { Category } from '../../src/models/Category';

describe('Category', () => {
  describe('constructor', () => {
    it('should create a category with all required properties', () => {
      const categoryData = {
        id: 'category-1',
        name: 'Programming',
        description: 'Learn programming languages and concepts',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const category = new Category(categoryData);

      expect(category.id).toBe(categoryData.id);
      expect(category.name).toBe(categoryData.name);
      expect(category.description).toBe(categoryData.description);
      expect(category.createdAt).toBe(categoryData.createdAt);
      expect(category.updatedAt).toBe(categoryData.updatedAt);
    });

    it('should create a category without description', () => {
      const categoryData = {
        id: 'category-1',
        name: 'Programming'
      };

      const category = new Category(categoryData);

      expect(category.id).toBe(categoryData.id);
      expect(category.name).toBe(categoryData.name);
      expect(category.description).toBeUndefined();
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
    });

    it('should use provided dates when specified', () => {
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');

      const categoryData = {
        id: 'category-1',
        name: 'Design',
        createdAt,
        updatedAt
      };

      const category = new Category(categoryData);

      expect(category.createdAt).toBe(createdAt);
      expect(category.updatedAt).toBe(updatedAt);
    });

    it('should generate dates when not provided', () => {
      const categoryData = {
        id: 'category-1',
        name: 'Business'
      };

      const category = new Category(categoryData);

      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle empty description', () => {
      const categoryData = {
        id: 'category-1',
        name: 'Marketing',
        description: ''
      };

      const category = new Category(categoryData);

      expect(category.description).toBe('');
    });
  });
});
