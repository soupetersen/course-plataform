import { Button } from "../ui/button";
import { Grid, List } from "lucide-react";

interface CoursesHeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const CoursesHeader = ({
  viewMode,
  onViewModeChange,
}: CoursesHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cursos</h1>
        <p className="text-gray-600">Descubra e aprenda com nossos cursos</p>
      </div>
      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
