export interface QuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id?: string;
  text: string;
  options: QuestionOption[];
  explanation?: string;
}

export interface QuizFormData {
  title: string;
  description: string;
  passThreshold: number;
  questions: QuizQuestion[];
  timeLimit?: number;
  showExplanations: boolean;
  allowRetakes: boolean;
  randomizeQuestions: boolean;
}
