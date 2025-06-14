import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ModuleForm } from './ModuleForm';
import { LessonForm } from './LessonForm';
import type { Module, Lesson } from '@/types/api';

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
  VIDEO: 'bg-blue-100 text-blue-800',
  TEXT: 'bg-green-100 text-green-800',
  QUIZ: 'bg-yellow-100 text-yellow-800',
  ASSIGNMENT: 'bg-purple-100 text-purple-800',
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
    setSelectedModule(modules.find(m => m.id === moduleId) || null);
    setIsLessonDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson, moduleId: string) => {
    setSelectedLesson(lesson);
    setSelectedModule(modules.find(m => m.id === moduleId) || null);
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#00224D]">MÃ³dulos e Aulas</h2>
          <p className="text-gray-600">Gerencie o conteÃºdo do seu curso</p>
        </div>
        <Button onClick={handleCreateModule} className="bg-[#FF204E] hover:bg-[#E01D4A]">
          <Plus className="w-4 h-4 mr-2" />
          Novo MÃ³dulo
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
                Nenhum mÃ³dulo criado
              </h3>
              <p className="text-gray-600 mb-4">
                Crie seu primeiro mÃ³dulo para comeÃ§ar a organizar o conteÃºdo
              </p>
              <Button onClick={handleCreateModule} className="bg-[#FF204E] hover:bg-[#E01D4A]">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro MÃ³dulo
              </Button>
            </CardContent>
          </Card>
        ) : (
          modules.map((module) => (
            <Card key={module.id} className="border-l-4 border-l-[#FF204E]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="cursor-move"
                      draggable
                    >
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
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
                    <Badge variant="secondary">
                      Ordem {module.order}
                    </Badge>
                    <Badge variant="secondary">
                      {module.lessons?.length || 0} aulas
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditModule(module)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
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
                <CardContent className="pt-0">                  <div className="space-y-2">
                    {module.lessons.map((lesson) => {
                      const IconComponent = lessonTypeIcons[lesson.type || 'VIDEO'];
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="cursor-move"
                              draggable
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <IconComponent className="w-4 h-4 text-gray-600" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  {lesson.title}
                                </h4>                                <Badge 
                                  className={lessonTypeColors[lesson.type || 'VIDEO']}
                                  variant="secondary"
                                >
                                  {lesson.type || 'VIDEO'}
                                </Badge>
                                {lesson.isPreview && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Preview
                                  </Badge>
                                )}
                                {lesson.isLocked && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Bloqueada
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Ordem {lesson.order}</span>
                                {lesson.type === 'VIDEO' && (
                                  <span>
                                    <Play className="w-3 h-3 inline mr-1" />
                                    {formatDuration(lesson.duration)}
                                  </span>
                                )}
                                {lesson.videoUrl && (
                                  <span className="text-green-600">
                                    VÃ­deo disponÃ­vel
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLesson(lesson, module.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
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
                    <Video className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm">
                      Nenhuma aula criada neste mÃ³dulo
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
              {selectedModule ? 'Editar MÃ³dulo' : 'Novo MÃ³dulo'}
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
              {selectedLesson ? 'Editar Aula' : 'Nova Aula'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <LessonForm
              courseId={courseId}
              moduleId={selectedModule?.id || ''}
              lesson={selectedLesson}
              onSuccess={handleLessonSuccess}
              onCancel={() => setIsLessonDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
