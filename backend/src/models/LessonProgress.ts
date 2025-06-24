export class LessonProgress {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly lessonId: string,
    public readonly courseId: string,
    public readonly isCompleted: boolean,
    public readonly watchTime: number,
    public readonly completedAt: Date | null,
    public readonly lastAccessed: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class QuizAttempt {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly lessonId: string,
    public readonly courseId: string,
    public readonly score: number,
    public readonly totalQuestions: number,
    public readonly correctAnswers: number,
    public readonly isPassing: boolean,
    public readonly completedAt: Date,
    public readonly timeSpent: number
  ) {}
}

export class QuizAnswer {
  constructor(
    public readonly id: string,
    public readonly attemptId: string,
    public readonly questionId: string,
    public readonly selectedOptionId: string | null,
    public readonly isCorrect: boolean,
    public readonly timeSpent: number,
    public readonly createdAt: Date
  ) {}
}
