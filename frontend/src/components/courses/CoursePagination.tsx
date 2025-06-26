import { Button } from "../ui/button";

interface CoursePaginationData {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CoursePaginationProps {
  pagination: CoursePaginationData | undefined;
  onPageChange: (page: number) => void;
}

export const CoursePagination = ({
  pagination,
  onPageChange,
}: CoursePaginationProps) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center space-x-2 animate-fade-in">
      <Button
        variant="outline"
        disabled={pagination.page === 1}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Anterior
      </Button>{" "}
      <span className="flex items-center px-4 text-sm text-gray-600">
        Página {pagination.page} de {pagination.totalPages}
      </span>
      <Button
        variant="outline"
        disabled={pagination.page === pagination.totalPages}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Próxima
      </Button>
    </div>
  );
};

