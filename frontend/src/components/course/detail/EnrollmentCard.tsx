import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ShoppingCart, Users, Star, TrendingUp, Lock } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../../types/api";

interface EnrollmentCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
  isEnrolling: boolean;
}

export const EnrollmentCard = ({
  course,
  isEnrolled,
  onEnroll,
  isEnrolling,
}: EnrollmentCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEnrollClick = () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${course.id}`);
      return;
    }
    onEnroll();
  };

  return (
    <div className="sticky top-6">
      <Card className="animate-slide-in-left">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#00224D]">
            {course.price === 0 ? "Gratuito" : `R$ ${course.price.toFixed(2)}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleEnrollClick}
            disabled={isEnrolled || isEnrolling}
            className="w-full bg-[#FF204E] hover:bg-[#A0153E] text-white h-12 text-lg font-semibold"
          >
            {isEnrolling ? (
              "Processando..."
            ) : isEnrolled ? (
              "Já matriculado"
            ) : !user ? (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Entrar para matricular
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Matricular-se agora
              </>
            )}
          </Button>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {course.enrollments_count || 0} alunos matriculados
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                {course.average_rating?.toFixed(1) || "0.0"} de avaliação
              </span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm">Atualizado recentemente</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Inclui:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {" "}
              <li>• Acesso vitalício ao curso</li>
              <li>• Certificado de conclusão</li>
              <li>• Suporte do instrutor</li>
              <li>• Acesso em dispositivos móveis</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <Badge variant="outline" className="w-full justify-center">
              Garantia de 30 dias
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
