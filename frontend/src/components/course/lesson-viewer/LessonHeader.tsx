import React from "react";

interface LessonHeaderProps {
  title: string;
  description?: string;
  type: string;
  duration?: number;
  order: number;
  isCompleted?: boolean;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
  title,
  description,
  type,
  duration,

  isCompleted,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {isCompleted && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <span className="text-green-600">✓</span>
                <span>Concluída</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-gray-600 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
            📚
          </span>
          <span className="font-medium">Tipo:</span>
          <span className="capitalize">
            {type?.toLowerCase() || "Não especificado"}
          </span>
        </div>

        {duration && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-5 h-5 flex items-center justify-center bg-orange-100 text-orange-600 rounded">
              ⏱️
            </span>
            <span className="font-medium">Duração:</span>
            <span>
              {Math.floor(duration / 60)}:
              {(duration % 60).toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

