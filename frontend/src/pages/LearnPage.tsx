import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  PlayCircle,
  Clock,
  Lock,
  Eye,
  User,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCourse } from "@/hooks/useCourses";
import { useModulesByCourse } from "@/hooks/useModulesAndLessons";
import { useMyEnrollments } from "@/hooks/useCategoriesAndEnrollments";
import LessonViewer from "@/components/course/LessonViewer";
import type { Module, Lesson, LessonType } from "@/types/api";
import { LucideIcon } from "lucide-react";

const lessonTypeIcons: Record<LessonType, LucideIcon> = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
};

const lessonTypeColors: Record<LessonType, string> = {
  VIDEO: "bg-blue-100 text-blue-800",
  TEXT: "bg-green-100 text-green-800",
  QUIZ: "bg-yellow-100 text-yellow-800",
  ASSIGNMENT: "bg-purple-100 text-purple-800",
};

export function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: courseData, isLoading: courseLoading } = useCourse(courseId!);
  const { data: modulesData, isLoading: modulesLoading } = useModulesByCourse(
    courseId!
  );
  const { data: enrollmentsData } = useMyEnrollments();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const course = courseData?.data;
  const modules = useMemo(() => modulesData?.data || [], [modulesData?.data]);
  const enrollments = enrollmentsData?.data || [];

  // Verificar se o usuário está matriculado
  const isEnrolled = enrollments.some(
    (enrollment) => enrollment.courseId === courseId
  );

  // Encontrar a primeira lição disponível se nenhuma estiver selecionada
  useEffect(() => {
    if (!selectedLessonId && modules.length > 0) {
      const firstModule = modules[0];
      if (firstModule?.lessons && firstModule.lessons.length > 0) {
        const firstLesson = firstModule.lessons[0];
        if (firstLesson && !firstLesson.isLocked) {
          setSelectedLessonId(firstLesson.id);
          // Abrir o primeiro módulo por padrão
          setOpenModules((prev) => ({ ...prev, [firstModule.id]: true }));
        }
      }
    }
  }, [modules, selectedLessonId]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const selectLesson = (lesson: Lesson) => {
    if (lesson.isLocked && !isEnrolled && !lesson.isPreview) {
      return; // Não permitir acesso a lições bloqueadas
    }
    setSelectedLessonId(lesson.id);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calculateModuleProgress = (module: Module) => {
    if (!module.lessons || module.lessons.length === 0) return 0;
    // TODO: Implementar cálculo real de progresso baseado em LessonProgress
    return 0;
  };

  const calculateCourseProgress = () => {
    if (modules.length === 0) return 0;
    // TODO: Implementar cálculo real de progresso do curso
    return 0;
  };

  if (courseLoading || modulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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

  const token = localStorage.getItem("authToken") || "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/my-learning"
                className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Meus Cursos
              </Link>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {course.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  {course.instructor?.name}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="text-sm text-gray-600">Progresso do Curso</div>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={calculateCourseProgress()}
                    className="w-32"
                  />
                  <span className="text-sm font-medium">
                    {calculateCourseProgress()}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Módulos e Lições */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Conteúdo do Curso
              </h2>
              <div className="text-sm text-gray-600">
                {modules.length} módulos •{" "}
                {modules.reduce(
                  (acc, module) => acc + (module.lessons?.length || 0),
                  0
                )}{" "}
                aulas
              </div>
            </div>

            <div className="space-y-3">
              {modules.map((module, moduleIndex) => {
                const isOpen = openModules[module.id];
                const moduleProgress = calculateModuleProgress(module);

                return (
                  <Card key={module.id} className="border-l-4 border-l-primary">
                    <Collapsible
                      open={isOpen}
                      onOpenChange={() => toggleModule(module.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-medium text-gray-900">
                                {moduleIndex + 1}. {module.title}
                              </CardTitle>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <PlayCircle className="w-3 h-3 mr-1" />
                                {module.lessons?.length || 0} aulas
                                {moduleProgress > 0 && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>{moduleProgress}% concluído</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-3">
                          {module.lessons && module.lessons.length > 0 ? (
                            <div className="space-y-2">
                              {module.lessons.map((lesson, lessonIndex) => {
                                const IconComponent =
                                  lessonTypeIcons[lesson.type || "VIDEO"];
                                const isSelected =
                                  selectedLessonId === lesson.id;
                                const isLocked =
                                  lesson.isLocked && !lesson.isPreview;
                                const canAccess = !isLocked || isEnrolled;

                                return (
                                  <div
                                    key={lesson.id}
                                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                      isSelected
                                        ? "bg-primary/10 border border-primary/20"
                                        : canAccess
                                        ? "hover:bg-gray-50"
                                        : "opacity-50 cursor-not-allowed"
                                    }`}
                                    onClick={() =>
                                      canAccess && selectLesson(lesson)
                                    }
                                  >
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                                          {lessonIndex + 1}
                                        </div>
                                        <IconComponent className="w-4 h-4 text-gray-600" />
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                          <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {lesson.title}
                                          </h4>
                                          {lesson.isPreview && (
                                            <Badge
                                              variant="outline"
                                              className="text-green-600 border-green-600 text-xs"
                                            >
                                              <Eye className="w-3 h-3 mr-1" />
                                              Preview
                                            </Badge>
                                          )}
                                          {isLocked && (
                                            <Lock className="w-3 h-3 text-orange-500" />
                                          )}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                          <Badge
                                            className={`${
                                              lessonTypeColors[
                                                lesson.type || "VIDEO"
                                              ]
                                            } text-xs mr-2`}
                                            variant="secondary"
                                          >
                                            {lesson.type || "VIDEO"}
                                          </Badge>
                                          {lesson.type === "VIDEO" &&
                                            lesson.duration && (
                                              <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatDuration(
                                                  lesson.duration
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </div>

                                      {/* TODO: Adicionar indicador de progresso da lição */}
                                      <div className="flex items-center">
                                        {/* Placeholder para progresso */}
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              Nenhuma aula neste módulo
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

        {/* Conteúdo Principal - Visualizador de Lição */}
        <div className="flex-1 overflow-y-auto">
          {selectedLessonId && courseId ? (
            <LessonViewer
              lessonId={selectedLessonId}
              courseId={courseId}
              token={token}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma aula
                </h3>
                <p className="text-gray-500">
                  Escolha uma aula na barra lateral para começar a estudar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
