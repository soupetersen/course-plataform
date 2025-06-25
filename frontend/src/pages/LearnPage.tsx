import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useCourse } from "@/hooks/useCourses";
import { useModulesByCourse } from "@/hooks/useModulesAndLessons";
import { useMyEnrollments } from "@/hooks/useCategoriesAndEnrollments";
import { useMyReviews, useCreateReview } from "@/hooks/useReviews";
import { useLessonWebSocket } from "@/hooks/useLessonWebSocket";
import { CourseReviewSection } from "@/components/course/lesson-viewer/CourseReviewSection";
import LessonViewer from "@/components/course/LessonViewer";

export function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: courseData, isLoading: courseLoading } = useCourse(courseId!);
  const { data: modulesData, isLoading: modulesLoading } = useModulesByCourse(
    courseId!
  );
  const { data: enrollmentsData } = useMyEnrollments();
  const { data: reviewsData } = useMyReviews();
  const createReviewMutation = useCreateReview();

  const token = localStorage.getItem("authToken") || "";
  const { lessonProgress, isConnected } = useLessonWebSocket(token);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const course = courseData?.data;
  const modules = useMemo(() => modulesData?.data || [], [modulesData?.data]);
  const enrollments = enrollmentsData?.data || [];
  const myReviews = reviewsData?.data || [];

  // Verificar se o usuário está matriculado
  const currentEnrollment = enrollments.find(
    (enrollment) => enrollment.courseId === courseId
  );
  const isEnrolled = !!currentEnrollment;

  // Verificar se o usuário já avaliou este curso
  const existingReview = myReviews.find(
    (review) => review.courseId === courseId
  );
  const hasReviewed = !!existingReview;

  // Calcular progresso baseado nas aulas concluídas
  const totalLessons = useMemo(() => {
    return modules.reduce(
      (total, module) => total + (module.lessons?.length || 0),
      0
    );
  }, [modules]);

  const completedLessonsCount = completedLessons.size;
  const calculatedProgress =
    totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;

  // Usar progresso calculado baseado nas aulas concluídas ou o progresso base
  const progress = Math.max(
    calculatedProgress,
    currentEnrollment?.progress || 0
  );

  // Verificar se o usuário atingiu 20% de progresso
  const canReview = progress >= 20 && !hasReviewed;

  // Verificar se a review foi dispensada para este curso
  useEffect(() => {
    if (courseId) {
      const dismissed = localStorage.getItem(`review_dismissed_${courseId}`);
      setReviewDismissed(dismissed === "true");
    }
  }, [courseId]);

  // Detectar quando o progresso muda via WebSocket para mostrar review automaticamente
  useEffect(() => {
    if (lessonProgress?.isCompleted && canReview && !reviewDismissed) {
      // Pequeno delay para dar tempo do progresso ser atualizado no backend
      const timer = setTimeout(() => {
        // Verificar novamente se ainda pode revisar depois da conclusão da lição
        if (progress >= 20 && !hasReviewed && !reviewDismissed) {
          // Abrir automaticamente o modal de review
          setIsReviewModalOpen(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    lessonProgress?.isCompleted,
    canReview,
    reviewDismissed,
    progress,
    hasReviewed,
  ]);

  // Carregar aulas concluídas dos dados dos módulos
  useEffect(() => {
    if (modules.length > 0) {
      const completed = new Set<string>();
      modules.forEach((module) => {
        module.lessons?.forEach((lesson) => {
          // Verificar se a aula tem completions (assumindo que se tem completions, está concluída)
          if (lesson.completions && lesson.completions.length > 0) {
            completed.add(lesson.id);
          }
        });
      });

      console.log(
        "📋 Aulas concluídas carregadas dos módulos:",
        Array.from(completed)
      );
      setCompletedLessons(completed);
      setIsLoadingProgress(false);
    }
  }, [modules]);

  // Atualizar aulas concluídas quando uma lição for completada
  useEffect(() => {
    console.log("🔍 Debug - lessonProgress:", lessonProgress);
    console.log("🔍 Debug - selectedLessonId:", selectedLessonId);

    if (lessonProgress?.isCompleted && selectedLessonId) {
      console.log("✅ Adicionando aula concluída:", selectedLessonId);
      setCompletedLessons((prev) => {
        const newSet = new Set(prev);
        newSet.add(selectedLessonId);
        console.log("📋 Aulas concluídas atualizadas:", Array.from(newSet));
        return newSet;
      });
    }
  }, [lessonProgress, selectedLessonId]);

  // Selecionar o primeiro módulo por padrão e a próxima aula não concluída
  useEffect(() => {
    if (!selectedModuleId && modules.length > 0) {
      setSelectedModuleId(modules[0].id);
      setOpenModules((prev) => ({ ...prev, [modules[0].id]: true }));
    }

    // Selecionar automaticamente a próxima aula não concluída se nenhuma estiver selecionada
    if (!selectedLessonId && modules.length > 0 && !isLoadingProgress) {
      let nextLesson: { id: string; moduleId: string } | null = null;

      // Procurar a primeira aula não concluída
      for (const module of modules) {
        if (module.lessons) {
          for (const lesson of module.lessons) {
            if (!completedLessons.has(lesson.id)) {
              nextLesson = { id: lesson.id, moduleId: module.id };
              break;
            }
          }
          if (nextLesson) break;
        }
      }

      // Se encontrou uma aula não concluída, selecione ela
      if (nextLesson) {
        setSelectedLessonId(nextLesson.id);
        setSelectedModuleId(nextLesson.moduleId);
        setOpenModules((prev) => ({ ...prev, [nextLesson.moduleId]: true }));
      }
    }
  }, [
    modules,
    selectedModuleId,
    selectedLessonId,
    completedLessons,
    isLoadingProgress,
  ]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const selectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(null);
  };

  // Função para submeter a review
  const handleReviewSubmit = async (data: {
    rating: number;
    comment: string;
  }) => {
    try {
      await createReviewMutation.mutateAsync({
        courseId: courseId!,
        rating: data.rating,
        comment: data.comment,
      });
      setIsReviewModalOpen(false);
      // Remover o estado de dispensado quando a review for enviada
      localStorage.removeItem(`review_dismissed_${courseId}`);
      setReviewDismissed(false);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    }
  };

  // Função para dispensar o prompt de review temporariamente
  const handleDismissReview = () => {
    if (courseId) {
      localStorage.setItem(`review_dismissed_${courseId}`, "true");
      setReviewDismissed(true);
    }
    setIsReviewModalOpen(false);
  };

  if (courseLoading || modulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Curso não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            O curso que você está procurando não existe.
          </p>
          <Link to="/courses">
            <Button>Voltar aos Cursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-4">
            Você precisa estar matriculado neste curso para acessar o conteúdo.
          </p>
          <Link to={`/courses/${courseId}`}>
            <Button>Ver Detalhes do Curso</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      {/* Sidebar - Módulos */}
      <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto shadow-xl">
        <div className="p-4">
          {/* Header do Curso */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-primary/5 via-blue-50/50 to-indigo-50/30 rounded-xl p-5 border border-primary/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  Conteúdo do Curso
                </h2>
                {isConnected && (
                  <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1.5"></div>
                    <span className="text-green-600 text-xs font-medium">
                      Online
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {modules.length}
                  </div>
                  <div className="text-xs text-gray-600">Módulos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {totalLessons}
                  </div>
                  <div className="text-xs text-gray-600">Aulas</div>
                </div>
              </div>

              {/* Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    Seu Progresso
                  </span>
                  <span className="font-bold text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {completedLessonsCount} de {totalLessons} aulas concluídas
                  </span>
                  {progress >= 20 && !hasReviewed && (
                    <Dialog
                      open={isReviewModalOpen}
                      onOpenChange={setIsReviewModalOpen}
                    >
                      <DialogTrigger asChild>
                        <button className="text-amber-600 font-medium hover:text-amber-700 transition-colors cursor-pointer flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Pode avaliar!
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <CourseReviewSection
                          courseTitle={course.title}
                          progress={progress}
                          onSubmit={handleReviewSubmit}
                          onDismiss={handleDismissReview}
                          isLoading={createReviewMutation.isPending}
                          showDismissButton={false}
                          isModal={true}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Módulos */}
          <div className="space-y-1.5">
            {modules.map((module, moduleIndex) => {
              const isOpen = openModules[module.id];
              const isSelected = selectedModuleId === module.id;

              // Calcular progresso do módulo
              const totalLessonsInModule = module.lessons?.length || 0;
              const completedLessonsInModule =
                module.lessons?.filter((lesson) => {
                  const isCurrentLesson = selectedLessonId === lesson.id;
                  return isCurrentLesson
                    ? lessonProgress?.isCompleted
                    : completedLessons.has(lesson.id);
                }).length || 0;
              const moduleProgress =
                totalLessonsInModule > 0
                  ? (completedLessonsInModule / totalLessonsInModule) * 100
                  : 0;

              return (
                <Card
                  key={module.id}
                  className={`group relative border-l-2 transition-all duration-200 hover:shadow-sm overflow-hidden ${
                    isSelected
                      ? "border-l-primary bg-gradient-to-r from-primary/3 to-blue-50/20 shadow-sm"
                      : "border-l-gray-200 bg-white hover:border-l-primary/50 hover:bg-gray-50/50"
                  }`}
                >
                  {/* Badge de status simplificado */}
                  {moduleProgress === 100 && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}

                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50/50 transition-all duration-200 py-2.5 px-3"
                        onClick={() => selectModule(module.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                                isSelected
                                  ? "bg-primary text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
                              }`}
                            >
                              {moduleIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle
                                className={`text-sm font-semibold transition-colors duration-200 line-clamp-1 ${
                                  isSelected
                                    ? "text-primary"
                                    : "text-gray-900 group-hover:text-primary"
                                }`}
                              >
                                {module.title}
                              </CardTitle>
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <span className="font-medium">
                                  {module.lessons?.length || 0} aulas
                                </span>
                                {moduleProgress > 0 && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="text-green-600 font-medium">
                                      {Math.round(moduleProgress)}% completo
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-1 px-3 bg-gray-50/30">
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="space-y-1">
                            {module.lessons.map((lesson, lessonIndex) => {
                              const isCurrentLesson =
                                selectedLessonId === lesson.id;
                              const isCompleted = isCurrentLesson
                                ? lessonProgress?.isCompleted
                                : completedLessons.has(lesson.id);

                              return (
                                <div
                                  key={lesson.id}
                                  className={`group flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 border ${
                                    isCurrentLesson
                                      ? "bg-primary/5 border-primary/20 shadow-sm"
                                      : isCompleted
                                      ? "bg-green-50/50 border-green-100 hover:border-green-200"
                                      : "hover:bg-white/80 border-transparent hover:border-gray-200"
                                  }`}
                                  onClick={() => setSelectedLessonId(lesson.id)}
                                >
                                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                                    <div
                                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                                        isCompleted
                                          ? "bg-green-500 text-white"
                                          : isCurrentLesson
                                          ? "bg-primary text-white"
                                          : "bg-gray-100 text-gray-600 group-hover:bg-primary/20 group-hover:text-primary"
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      ) : (
                                        lessonIndex + 1
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4
                                        className={`text-xs font-medium line-clamp-1 transition-colors duration-200 ${
                                          isCompleted
                                            ? "text-green-700"
                                            : isCurrentLesson
                                            ? "text-primary"
                                            : "text-gray-800 group-hover:text-primary"
                                        }`}
                                      >
                                        {lesson.title}
                                      </h4>
                                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>Aula {lessonIndex + 1}</span>
                                        {lesson.duration && (
                                          <>
                                            <span className="mx-1">•</span>
                                            <span>
                                              {Math.floor(lesson.duration / 60)}
                                              min
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {isCompleted && (
                                        <div className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium">
                                          Feito
                                        </div>
                                      )}
                                      {isCurrentLesson && !isCompleted && (
                                        <div className="bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                          Atual
                                        </div>
                                      )}
                                      <PlayCircle
                                        className={`w-4 h-4 transition-colors duration-200 flex-shrink-0 ${
                                          isCompleted
                                            ? "text-green-500"
                                            : isCurrentLesson
                                            ? "text-primary"
                                            : "text-gray-400 group-hover:text-primary"
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-3 text-center">
                            <p className="text-xs text-gray-500">
                              Aulas em breve
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto bg-white">
        {selectedLessonId && courseId ? (
          <LessonViewer
            lessonId={selectedLessonId}
            courseId={courseId}
            token={token}
          />
        ) : selectedModuleId ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50/50 to-blue-50/20">
            <div className="text-center max-w-md">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Módulo Selecionado
              </h3>
              <p className="text-gray-600 font-medium mb-2">
                {modules.find((m) => m.id === selectedModuleId)?.title}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                {modules.find((m) => m.id === selectedModuleId)?.lessons?.length
                  ? "Selecione uma aula na barra lateral para começar a estudar."
                  : "Este módulo ainda não possui aulas disponíveis. As aulas serão adicionadas em breve."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50/50 to-blue-50/20">
            <div className="text-center max-w-md">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bem-vindo ao Curso
              </h3>
              <p className="text-gray-600 mb-4">{course.title}</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Selecione um módulo na barra lateral para começar sua jornada de
                aprendizado.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
