import React from "react";
import ReactMarkdown from "react-markdown";

interface VideoSectionProps {
  videoUrl?: string;
  content?: string;
  currentTime: number;
  duration?: number;
  progressPercentage: number;
  watchTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  videoUrl,
  content,
  currentTime,
  duration,
  progressPercentage,
  watchTime,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded">
            🎥
          </span>
          Vídeo da Aula
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Player de Vídeo */}
        {videoUrl ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              controls
              className="w-full h-full"
              onPlay={onPlayPause}
              onPause={onPlayPause}
              onTimeUpdate={(e) =>
                onTimeUpdate(
                  Math.floor((e.target as HTMLVideoElement).currentTime)
                )
              }
            >
              <source src={videoUrl} type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          </div>
        ) : (
          /* Mock Video Player */
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <button
                onClick={onPlayPause}
                className="w-16 h-16 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center mb-4 transition-all"
              >
                <span className="text-2xl">{isPlaying ? "⏸️" : "▶️"}</span>
              </button>
              <p className="text-sm opacity-80">
                Vídeo simulado para demonstração
              </p>
            </div>
          </div>
        )}

        {/* Conteúdo adicional da lição */}
        {content && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span>📝</span>
              Informações da Aula
            </h3>
            <div className="prose prose-sm max-w-none text-blue-800">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Controles e Progresso */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span>🕒</span>
              <span className="font-medium">
                {Math.floor(currentTime / 60)}:
                {(currentTime % 60).toString().padStart(2, "0")}
                {duration && (
                  <>
                    {" / "}
                    {Math.floor(duration / 60)}:
                    {(duration % 60).toString().padStart(2, "0")}
                  </>
                )}
              </span>
            </div>

            <div className="text-xs text-gray-500">
              Progresso salvo: {Math.floor(watchTime / 60)}:
              {(watchTime % 60).toString().padStart(2, "0")}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
