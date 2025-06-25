import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import ReactMarkdown from "react-markdown";
import {
  Play,
  Pause,
  Volume2,
  Settings,
  Maximize,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

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
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, "seconds");
      onTimeUpdate(seconds);
    }
  };

  const handleSkip = (direction: "forward" | "backward") => {
    const skipAmount = 10; // 10 segundos
    const newTime =
      direction === "forward"
        ? Math.min(currentTime + skipAmount, duration || 0)
        : Math.max(currentTime - skipAmount, 0);
    handleSeek(newTime);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Garantir que a velocidade seja aplicada quando mudada
  useEffect(() => {
    if (playerRef.current) {
      console.log("Aplicando nova velocidade:", playbackRate);
      // Forçar atualização do player
      playerRef.current.getInternalPlayer()?.load?.();
    }
  }, [playbackRate]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg">
            <Play className="w-4 h-4" />
          </div>
          Vídeo da Aula
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Player de Vídeo Melhorado */}
        <div
          ref={containerRef}
          className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {videoUrl ? (
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              width="100%"
              height="100%"
              playing={isPlaying}
              volume={volume}
              muted={muted}
              playbackRate={playbackRate}
              onPlay={() => {}}
              onPause={() => {}}
              onProgress={({ playedSeconds }) =>
                onTimeUpdate(Math.floor(playedSeconds))
              }
              onDuration={() => {}}
              onReady={() => {
                // Garantir que a velocidade seja aplicada quando o player estiver pronto
                console.log(
                  "Player ready, setting playback rate to:",
                  playbackRate
                );
              }}
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload",
                  },
                },
              }}
              controls={false}
            />
          ) : (
            /* Mock Video Player Melhorado */
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <button
                  onClick={onPlayPause}
                  className="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </button>
                <p className="text-lg font-medium opacity-90 mb-2">
                  Vídeo de Demonstração
                </p>
                <p className="text-sm opacity-70">
                  Player simulado para testes
                </p>
              </div>
            </div>
          )}

          {/* Controles Customizados */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              {/* Barra de Progresso */}
              <div className="mb-3">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={(value: number[]) => handleSeek(value[0])}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPlayPause}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  {/* Skip Buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSkip("backward")}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSkip("forward")}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMuted(!muted)}
                      className="text-white hover:bg-white/20 p-2"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[muted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={(value: number[]) => {
                          setVolume(value[0] / 100);
                          setMuted(value[0] === 0);
                        }}
                      />
                    </div>
                  </div>

                  {/* Tempo */}
                  <span className="text-white text-sm font-medium ml-2">
                    {formatTime(currentTime)}{" "}
                    {duration && `/ ${formatTime(duration)}`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Velocidade de Reprodução */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 px-3 py-2"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        {playbackRate}x
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {playbackRates.map((rate) => (
                        <DropdownMenuItem
                          key={rate}
                          onClick={() => {
                            console.log("Changing playback rate to:", rate);
                            setPlaybackRate(rate);
                          }}
                          className={
                            playbackRate === rate
                              ? "bg-primary/10 text-primary font-medium"
                              : ""
                          }
                        >
                          <span className="flex items-center justify-between w-full">
                            {rate}x
                            {playbackRate === rate && (
                              <span className="text-primary">✓</span>
                            )}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

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
