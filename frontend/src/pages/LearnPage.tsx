import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCourse } from "@/hooks/useCourses";
import { useModulesByCourse } from "@/hooks/useModulesAndLessons";
import { useMyEnrollments } from "@/hooks/useCategoriesAndEnrollments";
import LessonViewer from "@/components/course/LessonViewer";

export function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: courseData, isLoading: courseLoading } = useCourse(courseId!);
  const { data: modulesData, isLoading: modulesLoading } = useModulesByCourse(
    courseId!
  );
  const { data: enrollmentsData } = useMyEnrollments();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const course = courseData?.data;
  const modules = useMemo(() => modulesData?.data || [], [modulesData?.data]);
  const enrollments = enrollmentsData?.data || [];

  // Verificar se o usuário está matriculado
  const isEnrolled = enrollments.some(
    (enrollment) => enrollment.courseId === courseId
  );

  // Selecionar o primeiro módulo por padrão
  useEffect(() => {
    if (!selectedModuleId && modules.length > 0) {
      setSelectedModuleId(modules[0].id);
      setOpenModules((prev) => ({ ...prev, [modules[0].id]: true }));
    }
  }, [modules, selectedModuleId]);

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

  const totalLessons = useMemo(() => {
    return modules.reduce(
      (total, module) => total + (module.lessons?.length || 0),
      0
    );
  }, [modules]);

  const completedLessons = 0; // TODO: Implementar lógica de progresso

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

  const token = localStorage.getItem("authToken") || "";

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      {/* Sidebar - Módulos */}
      <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto shadow-xl">
        <div className="p-4">
          {/* Header do Curso */}
          <div className="mb-4">
            <div className="bg-gradient-to-r from-primary/10 via-blue-50 to-indigo-50/80 rounded-lg p-4 border border-primary/20 shadow-sm backdrop-blur-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Conteúdo do Curso
              </h2>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="text-gray-600">
                  <span className="font-semibold text-primary">
                    {modules.length}
                  </span>
                  <span className="ml-1">módulos</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-white/60 text-primary border-primary/40 font-medium text-xs"
                >
                  {totalLessons} aulas
                </Badge>
              </div>
              {course?.description && (
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                  {course.description}
                </p>
              )}

              {/* Barra de Progresso */}
              <div className="pt-3 border-t border-gray-200/50">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Progresso do curso</span>
                  <span>
                    {Math.round((completedLessons / totalLessons) * 100) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/80 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(completedLessons / totalLessons) * 100 || 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Módulos */}
          <div className="space-y-2">
            {modules.map((module, moduleIndex) => {
              const isOpen = openModules[module.id];
              const isSelected = selectedModuleId === module.id;
              const hasLessons = module.lessons && module.lessons.length > 0;

              return (
                <Card
                  key={module.id}
                  className={`group relative border-l-3 transition-all duration-200 hover:shadow-md overflow-hidden ${
                    isSelected
                      ? "border-l-primary bg-gradient-to-r from-primary/5 to-blue-50/30 shadow-sm"
                      : "border-l-gray-300 bg-white hover:border-l-primary/60 hover:bg-gradient-to-r hover:from-gray-50/30 hover:to-blue-50/20"
                  }`}
                >
                  {/* Badge flutuante */}
                  {!hasLessons && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge
                        variant="outline"
                        className="bg-amber-50/95 text-amber-600 border-amber-200 text-xs px-2 py-0.5 font-medium backdrop-blur-sm shadow-sm"
                      >
                        Em breve
                      </Badge>
                    </div>
                  )}

                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-primary/3 hover:to-blue-50/30 transition-all duration-200 py-3 px-4 pr-16"
                        onClick={() => selectModule(module.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm transition-all duration-200 ${
                                isSelected
                                  ? "bg-gradient-to-br from-primary to-primary/80"
                                  : "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-primary/80 group-hover:to-primary"
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
                                <PlayCircle className="w-3 h-3 mr-1.5 text-primary/60" />
                                <span className="font-medium">
                                  {module.lessons?.length || 0}
                                </span>
                                <span className="ml-1">
                                  {module.lessons?.length === 1
                                    ? "aula"
                                    : "aulas"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            {hasLessons && (
                              <div className="absolute top-2 right-2 z-10">
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs px-2 py-0.5 font-medium"
                                >
                                  Disponível
                                </Badge>
                              </div>
                            )}
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
                      <CardContent className="pt-0 pb-2 px-4 bg-gradient-to-b from-gray-50/20 to-white">
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="space-y-1.5">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className={`group flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                                  selectedLessonId === lesson.id
                                    ? "bg-gradient-to-r from-primary/8 to-blue-50/40 border-primary/20 shadow-sm"
                                    : "hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-blue-50/20 border-gray-100/50 hover:border-primary/15"
                                }`}
                                onClick={() => setSelectedLessonId(lesson.id)}
                              >
                                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                                  <div
                                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                                      selectedLessonId === lesson.id
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-gray-200 text-gray-600 group-hover:bg-primary/20 group-hover:text-primary"
                                    }`}
                                  >
                                    {lessonIndex + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      className={`text-xs font-semibold line-clamp-1 transition-colors duration-200 ${
                                        selectedLessonId === lesson.id
                                          ? "text-primary"
                                          : "text-gray-800 group-hover:text-primary"
                                      }`}
                                    >
                                      {lesson.title}
                                    </h4>
                                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                      <Clock className="w-3 h-3 mr-1 text-primary/50" />
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
                                  <div className="flex items-center">
                                    {selectedLessonId === lesson.id && (
                                      <Badge className="bg-primary text-white text-xs px-1.5 py-0.5 mr-2">
                                        Atual
                                      </Badge>
                                    )}
                                    <PlayCircle
                                      className={`w-4 h-4 transition-colors duration-200 flex-shrink-0 ${
                                        selectedLessonId === lesson.id
                                          ? "text-primary"
                                          : "text-gray-400 group-hover:text-primary"
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gradient-to-b from-gray-50/20 to-white rounded-lg border border-dashed border-gray-200">
                            <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">
                              Nenhuma aula disponível
                            </p>
                            <p className="text-xs text-gray-400">
                              As aulas serão adicionadas em breve
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
