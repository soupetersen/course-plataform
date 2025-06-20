import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Clock, Users, Award, BookOpen, User } from "lucide-react";
import type { Course, Module, Review } from "../../../types/api";
import {
  ReviewList,
  CourseRatingStatsComponent,
  ReviewForm,
} from "../../reviews";
import { useCourseRatingStats } from "../../../hooks/useReviews";
import { useCurrentUser } from "../../../hooks/useAuth";
import { useCreateReview } from "../../../hooks/useReviews";
import { useState } from "react";

interface CourseTabsProps {
  course: Course;
  modules: Module[];
  reviews: Review[];
  isEnrolled?: boolean;
}

export const CourseTabs = ({
  course,
  modules,
  reviews,
  isEnrolled = false,
}: CourseTabsProps) => {
  const { data: ratingStatsData } = useCourseRatingStats(course.id);
  const { data: user } = useCurrentUser();
  const createReview = useCreateReview();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const ratingStats = ratingStatsData?.data;

  const userReview = reviews.find((review) => review.userId === user?.id);
  const canCreateReview = isEnrolled && user && !userReview;

  const handleCreateReview = async (data: {
    rating: number;
    comment: string;
  }) => {
    try {
      await createReview.mutateAsync({
        courseId: course.id,
        rating: data.rating,
        comment: data.comment,
      });
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error creating review:", error);
    }
  };

  return (
    <div className="animate-slide-in-left">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {" "}
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="curriculum">Conteúdo</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
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
                <CardTitle>Informações do curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Duração: {course.duration} horas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Nível: {course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Certificado de conclusão</span>
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
                <CardTitle>O que você vai aprender</CardTitle>
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
                      Objetivos não especificados
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
                    Módulo {module.order}: {module.title}
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
        </TabsContent>{" "}
        <TabsContent value="reviews" className="space-y-6">
          {ratingStats && <CourseRatingStatsComponent stats={ratingStats} />}

          {canCreateReview && (
            <Card>
              <CardHeader>
                <CardTitle>Avaliar este curso</CardTitle>
              </CardHeader>
              <CardContent>
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full p-4 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    Clique aqui para avaliar este curso
                  </button>
                ) : (
                  <ReviewForm
                    onSubmit={handleCreateReview}
                    onCancel={() => setShowReviewForm(false)}
                    isLoading={createReview.isPending}
                  />
                )}
              </CardContent>
            </Card>
          )}

          <ReviewList
            reviews={reviews}
            isLoading={false}
            currentUserId={user?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
