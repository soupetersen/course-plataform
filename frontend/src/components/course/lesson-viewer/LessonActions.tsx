import React from "react";

interface LessonActionsProps {
  isCompleted: boolean;
  completedAt?: string;
  onComplete: () => void;
}

export const LessonActions: React.FC<LessonActionsProps> = ({
  isCompleted,
  completedAt,
  onComplete,
}) => {
  if (isCompleted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-sm">✓</span>
          </div>
          <div className="flex-1">
            <p className="text-green-800 font-medium">Lição concluída!</p>
            {completedAt && (
              <p className="text-green-600 text-sm">
                Concluída em: {new Date(completedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <button
        onClick={onComplete}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
      >
        <span className="text-xs">✓</span>
        Marcar como Concluída
      </button>
    </div>
  );
};
