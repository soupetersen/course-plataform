import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  RotateCcw,
  RotateCw,
  Minimize,
} from "lucide-react";

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  onTimeUpdate,
  onEnded,
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState("1080p");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
    if (onTimeUpdate) {
      onTimeUpdate(state.playedSeconds);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeek = (value: number) => {
    const seekTime = (value / 100) * duration;
    playerRef.current?.seekTo(seekTime);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const skipTime = (seconds: number) => {
    const newTime = currentTime + seconds;
    playerRef.current?.seekTo(newTime);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    setShowSettings(false);
  };

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const qualityOptions = [
    "2160p",
    "1440p",
    "1080p",
    "720p",
    "480p",
    "360p",
    "auto",
  ];

  const getPlayerConfig = () => {
    return {
      file: {
        attributes: {
          poster: poster,
          controlsList: "nodownload",
          crossOrigin: "anonymous",
        },
        forceHLS: true,
        hlsOptions: {
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        },
      },
      youtube: {
        playerVars: {
          showinfo: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 1,
          cc_load_policy: 0,
          disablekb: 0,
          autohide: 0,
          color: "white",
          theme: "dark",
          quality: quality === "auto" ? "default" : quality,
          hd:
            quality.includes("1080") ||
            quality.includes("1440") ||
            quality.includes("2160")
              ? 1
              : 0,
        },
      },
    };
  };

  if (!src) {
    return (
      <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          No video source provided
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`video-player-container ${
        isFullscreen ? "fullscreen" : ""
      } group`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {title && !isFullscreen && (
        <div className="absolute top-4 left-4 z-20 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {title}
        </div>
      )}

      <div
        className={`video-player-wrapper ${isFullscreen ? "fullscreen" : ""}`}
      >
        <ReactPlayer
          ref={playerRef}
          url={src}
          playing={isPlaying}
          volume={isMuted ? 0 : volume}
          playbackRate={playbackRate}
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={onEnded}
          config={getPlayerConfig()}
          controls={false}
        />
      </div>

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            {isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} className="ml-1" />
            )}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={100}
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="progress-slider"
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => skipTime(-10)}
                className="video-control-button"
                title="Skip back 10 seconds"
              >
                <RotateCcw size={20} />
              </button>

              <button onClick={togglePlay} className="video-control-button">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button
                onClick={() => skipTime(10)}
                className="video-control-button"
                title="Skip forward 10 seconds"
              >
                <RotateCw size={20} />
              </button>

              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <span
                className={`quality-badge ${
                  quality.includes("1080") ||
                  quality.includes("1440") ||
                  quality.includes("2160")
                    ? "hd"
                    : ""
                } ${quality.includes("2160") ? "uhd" : ""}`}
              >
                {quality}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="video-control-button">
                  {isMuted || volume === 0 ? (
                    <VolumeX size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="video-control-button"
                >
                  <Settings size={20} />
                </button>

                {showSettings && (
                  <div className="video-settings-menu">
                    <div className="video-settings-section">
                      <div className="video-settings-title">Quality</div>
                      <div className="space-y-1">
                        {qualityOptions.map((qual) => (
                          <button
                            key={qual}
                            onClick={() => handleQualityChange(qual)}
                            className={`video-settings-option ${
                              quality === qual ? "active" : ""
                            }`}
                          >
                            {qual}
                            {qual === "1080p" && (
                              <span className="ml-1 text-xs text-green-400">
                                HD
                              </span>
                            )}
                            {qual === "2160p" && (
                              <span className="ml-1 text-xs text-purple-400">
                                4K
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="video-settings-section">
                      <div className="video-settings-title">Playback Speed</div>
                      <div className="space-y-1">
                        {playbackRates.map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handlePlaybackRateChange(rate)}
                            className={`video-settings-option ${
                              playbackRate === rate ? "active" : ""
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="video-control-button"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
