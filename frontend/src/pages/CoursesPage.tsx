import { useState } from "react";
import { Link } from "react-router-dom";
import { useCourses } from "../hooks/useCourses";
import { useCategories } from "../hooks/useCategoriesAndEnrollments";
import { useAuth } from "../hooks/useAuth";
import { CoursesHeader } from "../components/courses/CoursesHeader";
import { CourseFiltersSection } from "../components/courses/CourseFiltersSection";
import { CourseGrid } from "../components/courses/CourseGrid";
import { CoursePagination } from "../components/courses/CoursePagination";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import type { CourseFilters } from "../types/api";

export const CoursesPage = () => {
  const { user } = useAuth();

  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 12,
    search: "",
    status: "PUBLISHED",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: coursesData, isLoading } = useCourses(filters);
  const { data: categoriesData } = useCategories();

  const courses = coursesData?.data || [];
  const categories = categoriesData?.data || [];

  const pagination =
    courses.length > 0
      ? {
          items: courses,
          total: courses.length,
          page: filters.page || 1,
          limit: filters.limit || 12,
          totalPages: Math.ceil(courses.length / (filters.limit || 12)),
        }
      : undefined;

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      page: 1,
    }));
  };

  const handleFilterChange = (
    key: keyof CourseFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: "",
      status: "PUBLISHED",
    });
    setSearchQuery("");
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (user) {
    return (
      <div className="space-y-6">
        <CoursesHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        <CourseFiltersSection
          filters={filters}
          searchQuery={searchQuery}
          categories={categories}
          onFiltersChange={handleFilterChange}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onClearFilters={clearFilters}
        />

        <CourseGrid
          courses={courses}
          isLoading={isLoading}
          viewMode={viewMode}
          onClearFilters={clearFilters}
        />

        <CoursePagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    );
  }

  // Para usu�rios n�o logados, usa layout completo
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de Descoberta para visitantes */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12 animate-in fade-in duration-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-in slide-in-from-top-6 fade-in duration-600">
              Descubra Nossos Cursos
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-600 delay-200">
              Uma ampla variedade de cursos para aprimorar suas habilidades e
              aprender algo novo.
            </p>
            <div className="max-w-2xl mx-auto relative animate-in zoom-in-95 fade-in duration-600 delay-400">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar cursos, habilidades ou instrutores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 pr-4 py-3 text-lg h-12 focus:scale-[1.02] transition-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conte�do dos Cursos para visitantes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-[#FF204E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para início
          </Link>
        </div>

        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              {courses.length} cursos encontrados
            </h2>
            <div className="text-sm text-gray-500">
              Ordenar por: Mais Populares
            </div>
          </div>

          <CourseFiltersSection
            filters={filters}
            searchQuery={searchQuery}
            categories={categories}
            onFiltersChange={handleFilterChange}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onClearFilters={clearFilters}
          />

          <CourseGrid
            courses={courses}
            isLoading={isLoading}
            viewMode="grid"
            onClearFilters={clearFilters}
          />

          <CoursePagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};
