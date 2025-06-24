import React, { useEffect, useState } from 'react';
import { useLessonWebSocket } from '@/hooks/useLessonWebSocket';
import { useLesson } from '@/hooks/useLessons';
import { Question, QuestionOption } from '@/types/lesson';

interface LessonViewerProps {
  lessonId: string;
  courseId: string;
  token: string;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ lessonId, courseId, token }) => {
  const { data: lesson, isLoading } = useLesson(lessonId);
  const {
    isConnected,
    connectionState,
    joinLesson,
    updateVideoProgress,
    completeLesson,
    submitQuiz,
    lessonProgress,
    quizResult,
    error: wsError
  } = useLessonWebSocket(token);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  // Entrar na lição quando conectar
  useEffect(() => {
    if (isConnected && lessonId && courseId) {
      joinLesson(lessonId, courseId);
    }
  }, [isConnected, lessonId, courseId, joinLesson]);

  // Atualizar progresso do vídeo a cada 5 segundos
  useEffect(() => {
    if (!isPlaying || lesson?.type !== 'VIDEO') return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
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
      timeSpent: 30
    }));

    submitQuiz(answers);
  };

  const handleQuizAnswer = (questionId: string, optionId: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando lição...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-700">Lição não encontrada</p>
      </div>
    );
  }

  const progressPercentage = lesson.duration ? (currentTime / lesson.duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Status de Conexão */}
      <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
        <div 
          className={`h-2 w-2 rounded-full ${ 
            connectionState === 'connected' ? 'bg-green-500' : 
            connectionState === 'connecting' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} 
        />
        <span className="text-sm text-gray-600">
          {connectionState === 'connected' ? 'Conectado' :
           connectionState === 'connecting' ? 'Conectando...' :
           'Desconectado'}
        </span>
      </div>

      {/* Erro do WebSocket */}
      {wsError && (
        <div className="p-4 border border-red-300 rounded-lg bg-red-50">
          <p className="text-red-700">{wsError}</p>
        </div>
      )}

      {/* Título da Lição */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {lessonProgress?.isCompleted && (
            <div className="h-5 w-5 text-green-500">✓</div>
          )}
        </div>
        <p className="text-gray-600">{lesson.description}</p>
      </div>

      {/* Conteúdo da Lição baseado no tipo */}
      {lesson.type === 'VIDEO' && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Vídeo</h2>
          
          {/* Mock Video Player */}
          <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center mb-4">
            <button
              onClick={handlePlayPause}
              className="text-white hover:bg-gray-800 p-4 rounded-full"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          </div>

          {/* Controles do Vídeo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">🕒</span>
              <span className="text-sm">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 
                {lesson.duration ? ` ${Math.floor(lesson.duration / 60)}:${(lesson.duration % 60).toString().padStart(2, '0')}` : ' --:--'}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="text-xs text-gray-500">
              Progresso salvo: {lessonProgress?.watchTime || 0}s
            </div>
          </div>
        </div>
      )}

      {lesson.type === 'TEXT' && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Conteúdo</h2>
          <div className="prose max-w-none">
            {lesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : (
              <p>Conteúdo não disponível</p>
            )}
          </div>
        </div>
      )}

      {lesson.type === 'QUIZ' && lesson.questions && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz</h2>
          
          <div className="space-y-6">
            {lesson.questions.map((question: Question, index: number) => (
              <div key={question.id} className="space-y-3">
                <h3 className="font-medium">
                  {index + 1}. {question.question}
                </h3>
                
                <div className="space-y-2">
                  {question.options?.map((option: QuestionOption) => (
                    <label
                      key={option.id}
                      className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={quizAnswers[question.id] === option.id}
                        onChange={() => handleQuizAnswer(question.id, option.id)}
                        className="text-blue-600"
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button 
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < lesson.questions.length}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar Quiz
            </button>

            {/* Resultado do Quiz */}
            {quizResult && (
              <div className={`p-4 border rounded-lg ${quizResult.isPassing ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="space-y-2">
                  <div className="font-medium">{quizResult.message}</div>
                  <div className="text-sm">
                    Pontuação: {quizResult.score.toFixed(1)}% 
                    ({quizResult.correctAnswers}/{quizResult.totalQuestions} corretas)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botão de Conclusão */}
      {!lessonProgress?.isCompleted && (
        <div className="border rounded-lg p-6">
          <button 
            onClick={handleCompleteLesson}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 text-lg font-medium"
          >
            Marcar como Concluída
          </button>
        </div>
      )}

      {/* Status de Conclusão */}
      {lessonProgress?.isCompleted && (
        <div className="p-4 border border-green-300 rounded-lg bg-green-50">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-green-700 font-medium">Lição concluída com sucesso!</span>
          </div>
          {lessonProgress.completedAt && (
            <div className="text-sm mt-1 text-green-600">
              Concluída em: {new Date(lessonProgress.completedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonViewer;
