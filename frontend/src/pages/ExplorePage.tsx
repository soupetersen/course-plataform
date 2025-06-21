import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Star,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategoriesAndEnrollments";
import { Course, CourseFilters } from "@/types/api";

export function ExplorePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filters, setFilters] = useState<CourseFilters>({
    status: "PUBLISHED",
    page: 1,
    limit: 12,
  });

  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategories();
  const { data: coursesResponse, isLoading: coursesLoading } = useCourses({
    ...filters,
    search: searchTerm || undefined,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const categories = categoriesResponse?.data || [];
  const courses = coursesResponse?.data || [];

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return "N/A";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {" "}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Explorar Cursos
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Descubra uma ampla variedade de cursos para aprimorar suas
              habilidades e aprender algo novo.
            </p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar cursos, habilidades ou instrutores..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg h-12"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {" "}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
          >
            Todos
          </Button>
          {categoriesLoading
            ? // Skeleton para categorias carregando
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 w-20 bg-gray-200 rounded animate-pulse"
                ></div>
              ))
            : categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
        </div>{" "}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {courses.length} cursos encontrados
          </h2>
          <div className="text-sm text-gray-500">
            Ordenar por: Mais Populares
          </div>
        </div>
        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardHeader className="pb-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course: Course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center overflow-hidden">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.category.name}
                    </Badge>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>{" "}
                <CardContent className="pt-0">
                  <div className="text-sm text-gray-600 mb-3">
                    por {course.instructor.name}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.averageRating.toFixed(1)}</span>
                    </div>{" "}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {(course.enrollments_count || 0) > 0
                          ? course.enrollments_count
                          : "Sem inscrições"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    Ver Curso
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {!coursesLoading && courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar seus termos de busca ou filtros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
