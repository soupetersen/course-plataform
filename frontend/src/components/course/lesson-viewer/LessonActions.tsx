import React, { useState } from "react";
import { Check, CheckCircle } from "lucide-react";

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
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
    } finally {
      setIsCompleting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-green-800 font-medium">Lição concluída!</p>
            {completedAt && (
              <p className="text-green-600 text-sm">
                Concluída em: {new Date(completedAt).toLocaleString("pt-BR")}
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
        onClick={handleComplete}
        disabled={isCompleting}
        className={`inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow ${
          isCompleting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isCompleting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Concluindo...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Marcar como Concluída
          </>
        )}
      </button>
    </div>
  );
};
