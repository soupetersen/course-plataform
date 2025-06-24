export class Question {
  constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public readonly question: string,
    public readonly explanation: string | null,
    public readonly order: number,
    public readonly points: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class QuestionOption {
  constructor(
    public readonly id: string,
    public readonly questionId: string,
    public readonly text: string,
    public readonly isCorrect: boolean,
    public readonly order: number,
    public readonly createdAt: Date
  ) {}
}
