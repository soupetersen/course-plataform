import { useParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useCourse } from "@/hooks/useCourses";
import { useModulesByCourse } from "@/hooks/useModulesAndLessons";
import { VideoPlayer } from "@/components/video/VideoPlayer";

export function LessonPage() {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const { data: courseData } = useCourse(courseId!);
  const { data: modulesData } = useModulesByCourse(courseId!);

  const lesson = modulesData?.data
    ?.flatMap((module) => module.lessons || [])
    ?.find((lesson) => lesson.id === lessonId!);

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Aula nÃ£o encontrada
        </h2>
        <p className="text-gray-600">
          A aula que vocÃª estÃ¡ procurando nÃ£o existe.
        </p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#00224D] mb-2">
            {lesson.title}
          </h1>
          <p className="text-gray-600">{courseData?.data?.title}</p>
        </div>

        <div className="mb-8">
          <VideoPlayer
            src={lesson.videoUrl}
            title={lesson.title}
            onTimeUpdate={(currentTime) => {
              console.log("Video progress:", currentTime);
            }}
            onEnded={() => {
              console.log("Video ended");
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="prose max-w-none">
              <h2>ConteÃºdo da Aula</h2>

              {lesson.content && (
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Progresso do Curso</h3>
              <div className="space-y-2">
                {modulesData?.data?.map((module) => (
                  <div key={module.id}>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      {module.title}
                    </h4>
                    <div className="space-y-1 ml-2">
                      {module.lessons?.map((moduleLesson) => (
                        <div
                          key={moduleLesson.id}
                          className={`text-sm p-2 rounded ${
                            moduleLesson.id === lesson.id
                              ? "bg-[#FF204E] text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {moduleLesson.title}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
