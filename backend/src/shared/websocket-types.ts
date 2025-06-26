export enum LessonEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_LESSON = 'join_lesson',
  LEAVE_LESSON = 'leave_lesson',
  
  VIDEO_PROGRESS_UPDATE = 'video_progress_update',
  VIDEO_PROGRESS_SAVED = 'video_progress_saved',
  
  LESSON_COMPLETED = 'lesson_completed',
  LESSON_COMPLETION_CONFIRMED = 'lesson_completion_confirmed',
  
  QUIZ_STARTED = 'quiz_started',
  QUIZ_QUESTION_ANSWERED = 'quiz_question_answered',
  QUIZ_SUBMITTED = 'quiz_submitted',
  QUIZ_RESULT = 'quiz_result',
  
  USER_JOINED_LESSON = 'user_joined_lesson',
  USER_LEFT_LESSON = 'user_left_lesson',
  INSTRUCTOR_MESSAGE = 'instructor_message',
  
  SYNC_PROGRESS = 'sync_progress',
  PROGRESS_SYNCED = 'progress_synced',
  
  ERROR = 'error',
  UNAUTHORIZED = 'unauthorized',
}

export interface LessonProgressUpdate {
  userId: string;
  lessonId: string;
  courseId: string;
  watchTime: number;
  duration?: number;
  percentage?: number;
  timestamp: number;
}

export interface LessonCompletion {
  userId: string;
  lessonId: string;
  courseId: string;
  completedAt: string;
  finalWatchTime?: number;
}

export interface QuizSubmission {
  userId: string;
  lessonId: string;
  courseId: string;
  answers: Array<{
    questionId: string;
    selectedOptionId?: string;
    timeSpent: number;
  }>;
  totalTimeSpent: number;
}

export interface QuizResult {
  attemptId: string;
  userId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  isPassing: boolean;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    selectedOptionId?: string;
    correctOptionId?: string;
  }>;
}

export interface UserJoinedLesson {
  userId: string;
  userName: string;
  lessonId: string;
  courseId: string;
  joinedAt: string;
}

export interface SocketUser {
  userId: string;
  userName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  currentLessonId?: string;
  currentCourseId?: string;
}
