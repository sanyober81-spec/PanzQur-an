import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { audioService, AudioPlayerState } from '../../services/audioService';

export const MiniAudioPlayer: React.FC = () => {
  const [audioState, setAudioState] = useState<AudioPlayerState>(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  if (!audioState.track && !audioState.errorMessage) {
    return null;
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress =
    audioState.duration > 0
      ? (audioState.currentTime / audioState.duration) * 100
      : 0;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-xl mx-auto z-40 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-[#E5E1D5] animate-in slide-in-from-bottom duration-300">
      {/* Error display if audio fails */}
      {audioState.errorMessage ? (
        <div className="flex items-center justify-between gap-3 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{audioState.errorMessage}</span>
          </div>
          <button
            onClick={() => audioService.stop()}
            className="p-1 hover:bg-rose-100 rounded text-rose-700 font-semibold"
          >
            Tutup
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#126B50] text-white flex items-center justify-center shrink-0">
                {audioState.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#24352B] truncate">
                  {audioState.track?.title}
                </h4>
                <p className="text-[11px] text-[#576B60] truncate">
                  {audioState.track?.subtitle}
                </p>
              </div>
            </div>

            {/* Play/Pause & Stop buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  if (audioState.isPlaying) {
                    audioService.pause();
                  } else {
                    audioService.resume();
                  }
                }}
                disabled={audioState.isLoading}
                className="w-8 h-8 rounded-full bg-[#126B50] hover:bg-[#0c4d39] text-white flex items-center justify-center transition-colors shadow-xs"
                title={audioState.isPlaying ? 'Jeda' : 'Lanjutkan'}
              >
                {audioState.isPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>

              <button
                onClick={() => audioService.stop()}
                className="w-8 h-8 rounded-full text-slate-500 hover:text-rose-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                title="Hentikan Audio"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Time & Seek Bar */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-[#84968C] tabular-nums min-w-[28px]">
              {formatTime(audioState.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={audioState.duration || 100}
              value={audioState.currentTime}
              onChange={(e) => audioService.seek(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#126B50]"
            />
            <span className="text-[10px] text-[#84968C] tabular-nums min-w-[28px] text-right">
              {formatTime(audioState.duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
