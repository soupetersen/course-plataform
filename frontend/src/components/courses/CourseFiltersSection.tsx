import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Filter } from "lucide-react";
import type { CourseFilters, Category } from "../../types/api";

interface CourseFiltersProps {
  filters: CourseFilters;
  searchQuery: string;
  categories: Category[];
  onFiltersChange: (
    key: keyof CourseFilters,
    value: string | number | undefined
  ) => void;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export const CourseFiltersSection = ({
  filters,
  searchQuery,
  categories,
  onFiltersChange,
  onSearchQueryChange,
  onSearch,
  onClearFilters,
}: CourseFiltersProps) => {
  return (
    <Card className="animate-slide-in-left">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={onSearch}>Buscar</Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="all"
              onClick={() => onFiltersChange("level", undefined)}
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="beginner"
              onClick={() => onFiltersChange("level", "BEGINNER")}
            >
              Iniciante
            </TabsTrigger>
            <TabsTrigger
              value="intermediate"
              onClick={() => onFiltersChange("level", "INTERMEDIATE")}
            >
              Intermediário
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              onClick={() => onFiltersChange("level", "ADVANCED")}
            >
              Avançado
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {categories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Categorias</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!filters.categoryId ? "default" : "outline"}
                size="sm"
                onClick={() => onFiltersChange("categoryId", undefined)}
              >
                Todas
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    filters.categoryId === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onFiltersChange("categoryId", category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {(filters.search || filters.level || filters.categoryId) && (
          <Button variant="ghost" onClick={onClearFilters} className="w-full">
            Limpar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
