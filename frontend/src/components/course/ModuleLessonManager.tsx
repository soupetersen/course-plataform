import React, { useState } from "react";
import {
  Plus,
  Edit,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  Play,
  Lock,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { ModuleForm } from "./ModuleForm";
import { LessonForm } from "./LessonForm";
import type { Module, Lesson } from "@/types/api";
import { useDeleteLesson } from "@/hooks/useModulesAndLessons";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface ModuleLessonManagerProps {
  courseId: string;
  modules: Module[];
  onRefresh: () => void;
}

const lessonTypeIcons = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
};

const lessonTypeColors = {
  VIDEO: "bg-blue-100 text-blue-800",
  TEXT: "bg-green-100 text-green-800",
  QUIZ: "bg-yellow-100 text-yellow-800",
  ASSIGNMENT: "bg-purple-100 text-purple-800",
};

export const ModuleLessonManager: React.FC<ModuleLessonManagerProps> = ({
  courseId,
  modules,
  onRefresh,
}) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteLesson = useDeleteLesson();
  const { handleError, handleSuccess } = useErrorHandler();

  const handleCreateModule = () => {
    setSelectedModule(null);
    setIsModuleDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setIsModuleDialogOpen(true);
  };

  const handleCreateLesson = (moduleId: string) => {
    setSelectedLesson(null);
    setSelectedModule(modules.find((m) => m.id === moduleId) || null);
    setIsLessonDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson, moduleId: string) => {
    setSelectedLesson(lesson);
    setSelectedModule(modules.find((m) => m.id === moduleId) || null);
    setIsLessonDialogOpen(true);
  };

  const handleModuleSuccess = () => {
    setIsModuleDialogOpen(false);
    setSelectedModule(null);
    onRefresh();
  };

  const handleLessonSuccess = () => {
    setIsLessonDialogOpen(false);
    setSelectedLesson(null);
    setSelectedModule(null);
    onRefresh();
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      await deleteLesson.mutateAsync(lessonToDelete.id);
      handleSuccess("Aula removida com sucesso!");
      setIsDeleteDialogOpen(false);
      setLessonToDelete(null);
      onRefresh();
    } catch (error) {
      handleError(error, {
        title: "Erro ao remover aula",
        description: "Tente novamente mais tarde",
      });
    }
  };

  const cancelDeleteLesson = () => {
    setIsDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between items-center">
        <div>
          {" "}
          <h2 className="text-2xl font-bold text-[#00224D]">Módulos e Aulas</h2>
          <p className="text-gray-600">Gerencie o conteúdo do seu curso</p>
        </div>
        <Button
          onClick={handleCreateModule}
          className="bg-[#FF204E] hover:bg-[#E01D4A]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      {}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum módulo criado
              </h3>
              <p className="text-gray-600 mb-4">
                Crie seu primeiro módulo para começar a organizar o conteúdo
              </p>
              <Button
                onClick={handleCreateModule}
                className="bg-[#FF204E] hover:bg-[#E01D4A]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Módulo
              </Button>
            </CardContent>
          </Card>
        ) : (
          modules.map((module) => (
            <Card key={module.id} className="border-l-4 border-l-[#FF204E]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Tooltip content="Arrastar para reordenar">
                      <div className="cursor-move" draggable>
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                    </Tooltip>
                    <div>
                      <CardTitle className="text-lg text-[#00224D]">
                        {module.title}
                      </CardTitle>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Ordem {module.order}</Badge>
                    <Badge variant="secondary">
                      {module.lessons?.length || 0} aulas
                    </Badge>
                    <Tooltip content="Editar módulo">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditModule(module)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateLesson(module.id)}
                      className="text-[#FF204E] border-[#FF204E] hover:bg-[#FF204E] hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Aula
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {}
              {module.lessons && module.lessons.length > 0 && (
                <CardContent className="pt-0">
                  {" "}
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => {
                      const IconComponent =
                        lessonTypeIcons[lesson.type || "VIDEO"];
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <Tooltip content="Arrastar para reordenar aula">
                              <div className="cursor-move" draggable>
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                            </Tooltip>
                            <Tooltip
                              content={`Tipo: ${lesson.type || "VIDEO"}`}
                            >
                              <IconComponent className="w-4 h-4 text-gray-600" />
                            </Tooltip>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  {lesson.title}
                                </h4>{" "}
                                <Tooltip
                                  content={`Tipo de aula: ${
                                    lesson.type || "VIDEO"
                                  }`}
                                >
                                  <Badge
                                    className={
                                      lessonTypeColors[lesson.type || "VIDEO"]
                                    }
                                    variant="secondary"
                                  >
                                    {lesson.type || "VIDEO"}
                                  </Badge>
                                </Tooltip>
                                {lesson.isPreview && (
                                  <Tooltip content="Esta aula pode ser visualizada sem inscrição">
                                    <Badge
                                      variant="outline"
                                      className="text-green-600 border-green-600"
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      Preview
                                    </Badge>
                                  </Tooltip>
                                )}
                                {lesson.isLocked && (
                                  <Tooltip content="Esta aula está bloqueada e requer pré-requisitos">
                                    <Badge
                                      variant="outline"
                                      className="text-orange-600 border-orange-600"
                                    >
                                      <Lock className="w-3 h-3 mr-1" />
                                      Bloqueada
                                    </Badge>
                                  </Tooltip>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Ordem {lesson.order}</span>
                                {lesson.type === "VIDEO" && (
                                  <span>
                                    <Play className="w-3 h-3 inline mr-1" />
                                    {formatDuration(lesson.duration)}
                                  </span>
                                )}{" "}
                                {lesson.videoUrl && (
                                  <span className="text-green-600">
                                    Vídeo disponível
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Tooltip content="Editar aula">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditLesson(lesson, module.id)
                                }
                                className="text-gray-600 hover:text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Remover aula">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson)}
                                className="text-gray-600 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}

              {}
              {(!module.lessons || module.lessons.length === 0) && (
                <CardContent className="pt-0">
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    <Video className="w-8 h-8 mx-auto text-gray-400 mb-2" />{" "}
                    <p className="text-gray-600 text-sm">
                      Nenhuma aula criada neste módulo
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateLesson(module.id)}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Criar Primeira Aula
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? "Editar Módulo" : "Novo Módulo"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <ModuleForm
              courseId={courseId}
              module={selectedModule}
              onSuccess={handleModuleSuccess}
              onCancel={() => setIsModuleDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? "Editar Aula" : "Nova Aula"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <LessonForm
              courseId={courseId}
              moduleId={selectedModule?.id || ""}
              lesson={selectedLesson}
              onSuccess={handleLessonSuccess}
              onCancel={() => setIsLessonDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Lesson Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a aula "{lessonToDelete?.title}"?
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita.</strong> A aula será
              permanentemente removida do curso e todos os dados associados
              serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteLesson}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLesson}
              variant="destructive"
              disabled={deleteLesson.isPending}
            >
              {deleteLesson.isPending ? "Removendo..." : "Remover Aula"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
