export interface CreateQuestionDto {
  question: string;
  explanation?: string;
  order: number;
  points: number;
  options: CreateQuestionOptionDto[];
}

export interface UpdateQuestionDto {
  question?: string;
  explanation?: string;
  order?: number;
  points?: number;
}

export interface CreateQuestionOptionDto {
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface UpdateQuestionOptionDto {
  text?: string;
  isCorrect?: boolean;
  order?: number;
}

export interface QuestionResponseDto {
  id: string;
  question: string;
  explanation?: string;
  order: number;
  points: number;
  options: QuestionOptionResponseDto[];
}

export interface QuestionOptionResponseDto {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}
