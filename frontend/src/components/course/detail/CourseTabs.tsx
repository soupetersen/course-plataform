import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Clock, Users, Award, BookOpen, User, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Course, Module, Review } from "../../../types/api";

interface CourseTabsProps {
  course: Course;
  modules: Module[];
  reviews: Review[];
}

export const CourseTabs = ({ course, modules, reviews }: CourseTabsProps) => {
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="animate-slide-in-left">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">VisÃ£o Geral</TabsTrigger>
          <TabsTrigger value="curriculum">ConteÃºdo</TabsTrigger>
          <TabsTrigger value="reviews">AvaliaÃ§Ãµes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Sobre este curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {course.description}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>InformaÃ§Ãµes do curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    DuraÃ§Ã£o: {course.duration} horas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">NÃ­vel: {course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Certificado de conclusÃ£o</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Instrutor: {course.instructor.name}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>O que vocÃª vai aprender</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.objectives?.map(
                    (objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-[#FF204E] rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    )
                  ) || (
                    <li className="text-sm text-gray-500">
                      Objetivos nÃ£o especificados
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          {modules.map((module) => (
            <Card key={module.id} className="animate-slide-in-up">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    MÃ³dulo {module.order}: {module.title}
                  </span>
                  <Badge variant="outline">
                    {module.lessons?.length || 0} aulas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{module.description}</p>
                {module.lessons && module.lessons.length > 0 && (
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FF204E] text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {lesson.order}
                          </div>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-gray-500">
                              {lesson.type || "Aula"}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {lesson.duration} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AvaliaÃ§Ãµes dos alunos</span>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-500">
                    ({reviews.length} avaliaÃ§Ãµes)
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#A0153E] text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {review.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{review.user.name}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">
                            {formatDistanceToNow(new Date(review.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Ainda nÃ£o hÃ¡ avaliaÃ§Ãµes para este curso.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
