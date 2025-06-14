export class LessonComment {
  id: string;
  content: string;
  lessonId: string;
  enrollmentId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    content: string;
    lessonId: string;
    enrollmentId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.content = params.content;
    this.lessonId = params.lessonId;
    this.enrollmentId = params.enrollmentId;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }
}
