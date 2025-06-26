import React, { useEffect, useState } from "react";
import { useLessonWebSocket } from "@/hooks/useLessonWebSocket";
import { useLesson } from "@/hooks/useLessons";
import { Question, QuestionOption } from "@/types/lesson";
import {
  LessonHeader,
  TextContent,
  VideoSection,
  LessonActions,
} from "./lesson-viewer";
import { LessonComments } from "./LessonComments";

interface LessonViewerProps {
  lessonId: string;
  courseId: string;
  token: string;
}

const LessonViewer: React.FC<LessonViewerProps> = ({
  lessonId,
  courseId,
  token,
}) => {
  const { data: lesson, isLoading } = useLesson(lessonId);
  const {
    isConnected,
    joinLesson,
    updateVideoProgress,
    completeLesson,
    submitQuiz,
    lessonProgress,
    quizResult,
    error: wsError,
  } = useLessonWebSocket(token);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lesson) {
      console.log("🎓 Dados da lição:", {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        hasQuestions: !!lesson.questions,
        questionsCount: lesson.questions?.length || 0,
      });
    }
  }, [lesson]);

  useEffect(() => {
    if (isConnected && lessonId && courseId) {
      joinLesson(lessonId, courseId);
    }
  }, [isConnected, lessonId, courseId, joinLesson]);

  useEffect(() => {
    if (!isPlaying || lesson?.type !== "VIDEO") return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 1;
        if (newTime % 5 === 0) {
          updateVideoProgress(newTime);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, lesson?.type, updateVideoProgress]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleCompleteLesson = () => {
    completeLesson();
  };

  const handleQuizSubmit = () => {
    if (!lesson?.questions) return;

    const answers = lesson.questions.map((question: Question) => ({
      questionId: question.id,
      selectedOptionId: quizAnswers[question.id],
      timeSpent: 30,
    }));

    submitQuiz(answers);
  };

  const handleQuizAnswer = (questionId: string, optionId: string) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">Carregando lição...</div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-6 border border-red-300 rounded-lg bg-red-50">
        <div className="text-center">
          <p className="text-red-700 font-medium mb-2">
            ❌ Lição não encontrada
          </p>
          <p className="text-red-600 text-sm">
            ID da lição: {lessonId} não pôde ser carregada
          </p>
        </div>
      </div>
    );
  }

  const progressPercentage = lesson.duration
    ? (currentTime / lesson.duration) * 100
    : 0;

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          type={lesson.type}
          duration={lesson.duration}
          order={lesson.order}
          isCompleted={lessonProgress?.isCompleted}
        />

        {wsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{wsError}</p>
          </div>
        )}

        {lesson.type === "VIDEO" && (
          <VideoSection
            videoUrl={lesson.videoUrl}
            content={lesson.content}
            currentTime={currentTime}
            duration={lesson.duration}
            progressPercentage={progressPercentage}
            watchTime={lessonProgress?.watchTime || 0}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onTimeUpdate={setCurrentTime}
          />
        )}

        {lesson.type === "TEXT" && <TextContent content={lesson.content} />}

        {lesson.type !== "VIDEO" &&
          lesson.type !== "TEXT" &&
          lesson.type !== "QUIZ" && (
            <TextContent content={lesson.content} title="Conteúdo da Lição" />
          )}

        {lesson.type === "QUIZ" && lesson.questions && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-600 rounded">
                  🧠
                </span>
                Quiz
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {lesson.questions.map((question: Question, index: number) => (
                <div key={question.id} className="space-y-3">
                  <h3 className="font-medium text-gray-900">
                    {index + 1}. {question.question}
                  </h3>

                  <div className="space-y-2">
                    {question.options?.map((option: QuestionOption) => (
                      <label
                        key={option.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={quizAnswers[question.id] === option.id}
                          onChange={() =>
                            handleQuizAnswer(question.id, option.id)
                          }
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleQuizSubmit}
                  disabled={
                    Object.keys(quizAnswers).length < lesson.questions.length
                  }
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Enviar Quiz
                </button>
              </div>

              {quizResult && (
                <div
                  className={`p-4 border rounded-lg ${
                    quizResult.isPassing
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="font-medium">{quizResult.message}</div>
                    <div className="text-sm">
                      Pontuação: {quizResult.score.toFixed(1)}% (
                      {quizResult.correctAnswers}/{quizResult.totalQuestions}{" "}
                      corretas)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <LessonActions
          isCompleted={lessonProgress?.isCompleted || false}
          completedAt={
            lessonProgress?.completedAt
              ? typeof lessonProgress.completedAt === "string"
                ? lessonProgress.completedAt
                : lessonProgress.completedAt.toISOString()
              : undefined
          }
          onComplete={handleCompleteLesson}
        />

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <LessonComments lessonId={lessonId} />
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
