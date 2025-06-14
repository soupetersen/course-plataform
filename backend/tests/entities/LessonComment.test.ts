import { LessonComment } from '../../src/models/LessonComment';

describe('LessonComment', () => {
  describe('constructor', () => {
    it('should create a lesson comment with all required properties', () => {
      const commentData = {
        id: 'comment-1',
        content: 'This is a great lesson!',
        lessonId: 'lesson-1',
        enrollmentId: 'enrollment-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const comment = new LessonComment(commentData);

      expect(comment.id).toBe(commentData.id);
      expect(comment.content).toBe(commentData.content);
      expect(comment.lessonId).toBe(commentData.lessonId);
      expect(comment.enrollmentId).toBe(commentData.enrollmentId);
      expect(comment.createdAt).toBe(commentData.createdAt);
      expect(comment.updatedAt).toBe(commentData.updatedAt);
    });

    it('should create a lesson comment with minimal required properties', () => {
      const commentData = {
        id: 'comment-1',
        content: 'Simple comment',
        lessonId: 'lesson-1',
        enrollmentId: 'enrollment-1'
      };

      const comment = new LessonComment(commentData);

      expect(comment.id).toBe(commentData.id);
      expect(comment.content).toBe(commentData.content);
      expect(comment.lessonId).toBe(commentData.lessonId);
      expect(comment.enrollmentId).toBe(commentData.enrollmentId);
      expect(comment.createdAt).toBeInstanceOf(Date);
      expect(comment.updatedAt).toBeInstanceOf(Date);
    });

    it('should use provided dates when specified', () => {
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');

      const commentData = {
        id: 'comment-1',
        content: 'Comment with dates',
        lessonId: 'lesson-1',
        enrollmentId: 'enrollment-1',
        createdAt,
        updatedAt
      };

      const comment = new LessonComment(commentData);

      expect(comment.createdAt).toBe(createdAt);
      expect(comment.updatedAt).toBe(updatedAt);
    });

    it('should generate dates when not provided', () => {
      const commentData = {
        id: 'comment-1',
        content: 'Auto-dated comment',
        lessonId: 'lesson-1',
        enrollmentId: 'enrollment-1'
      };

      const comment = new LessonComment(commentData);

      expect(comment.createdAt).toBeInstanceOf(Date);
      expect(comment.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle empty content', () => {
      const commentData = {
        id: 'comment-1',
        content: '',
        lessonId: 'lesson-1',
        enrollmentId: 'enrollment-1'
      };

      const comment = new LessonComment(commentData);

      expect(comment.content).toBe('');
    });

    it('should handle long content', () => {
      const longContent = 'This is a very long comment that spans multiple lines and contains a lot of detailed feedback about the lesson content, teaching style, and overall quality of the educational material presented.';
      
      const commentData = {
        id: 'comment-1',
        content: longContent,
        lessonId: 'lesson-1',
        enrollmentId: 'enrollment-1'
      };

      const comment = new LessonComment(commentData);

      expect(comment.content).toBe(longContent);
    });
  });
});
