import { User, UserRole } from '../../src/models/User';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user with all required properties', () => {
      const userData = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'STUDENT' as UserRole,
        avatar: 'avatar.jpg',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const user = new User(userData);

      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).toBe(userData.password);
      expect(user.role).toBe(userData.role);
      expect(user.avatar).toBe(userData.avatar);
      expect(user.isActive).toBe(userData.isActive);
      expect(user.createdAt).toBe(userData.createdAt);
      expect(user.updatedAt).toBe(userData.updatedAt);
    });

    it('should set default values for optional properties', () => {
      const userData = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'STUDENT' as UserRole
      };

      const user = new User(userData);

      expect(user.isActive).toBe(true);
      expect(user.avatar).toBeUndefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle explicit false isActive value', () => {
      const userData = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'STUDENT' as UserRole,
        isActive: false
      };

      const user = new User(userData);

      expect(user.isActive).toBe(false);
    });
  });

  describe('create static method', () => {
    it('should create a user with generated ID and timestamps', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'INSTRUCTOR' as UserRole,
        avatar: 'avatar.jpg'
      };

      const user = User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).toBe(userData.password);
      expect(user.role).toBe(userData.role);
      expect(user.avatar).toBe(userData.avatar);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user without avatar', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'ADMIN' as UserRole
      };

      const user = User.create(userData);

      expect(user.avatar).toBeUndefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).toBe(userData.password);
      expect(user.role).toBe(userData.role);
    });

    it('should generate different IDs for different users', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'STUDENT' as UserRole
      };

      const user1 = User.create(userData);
      const user2 = User.create(userData);

      expect(user1.id).not.toBe(user2.id);
    });

    it('should handle all user roles', () => {
      const roles: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

      roles.forEach(role => {
        const userData = {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed_password',
          role
        };

        const user = User.create(userData);
        expect(user.role).toBe(role);
      });
    });
  });

  describe('timestamps', () => {
    it('should have createdAt and updatedAt close to current time when using create', () => {
      const beforeCreate = new Date();
      const user = User.create({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'STUDENT'
      });
      const afterCreate = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });
});
