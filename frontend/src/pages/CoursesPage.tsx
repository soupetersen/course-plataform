import { useState } from "react";
import { Link } from "react-router-dom";
import { useCourses } from "../hooks/useCourses";
import { useCategories } from "../hooks/useCategoriesAndEnrollments";
import { CoursesHeader } from "../components/courses/CoursesHeader";
import { CourseFiltersSection } from "../components/courses/CourseFiltersSection";
import { CourseGrid } from "../components/courses/CourseGrid";
import { CoursePagination } from "../components/courses/CoursePagination";
import { ArrowLeft } from "lucide-react";
import type { CourseFilters } from "../types/api";

export const CoursesPage = () => {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 12,
    search: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: coursesData, isLoading } = useCourses(filters);
  console.log("Rendering coursesData:", coursesData);
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
    });
    setSearchQuery("");
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
    </div>
  );
};
