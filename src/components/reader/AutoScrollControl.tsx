import React from 'react';
import { Play, Pause, Square, FastForward } from 'lucide-react';
import { ScrollSpeed } from '../../hooks/useAutoScroll';

interface AutoScrollControlProps {
  isActive: boolean;
  isPaused: boolean;
  speed: ScrollSpeed;
  onToggle: () => void;
  onStop: () => void;
  onSpeedChange: (speed: ScrollSpeed) => void;
}

const SPEEDS: ScrollSpeed[] = [0.5, 1, 1.5, 2, 3];

export const AutoScrollControl: React.FC<AutoScrollControlProps> = ({
  isActive,
  isPaused,
  speed,
  onToggle,
  onStop,
  onSpeedChange,
}) => {
  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-[#E5E1D5] flex items-center gap-1.5 transition-all">
      {/* Play / Pause / Resume button */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
          isActive && !isPaused
            ? 'bg-[#126B50] text-white shadow-xs'
            : isPaused
            ? 'bg-amber-100 text-amber-800'
            : 'bg-[#FAF9F4] text-[#24352B] hover:bg-[#F5F0D9]'
        }`}
        title={
          !isActive
            ? 'Mulai Auto-Scroll'
            : isPaused
            ? 'Lanjutkan Auto-Scroll'
            : 'Jeda Auto-Scroll'
        }
      >
        {!isActive ? (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Auto Scroll</span>
          </>
        ) : isPaused ? (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Lanjutkan</span>
          </>
        ) : (
          <>
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Jeda</span>
          </>
        )}
      </button>

      {/* Stop button (only when active) */}
      {isActive && (
        <button
          onClick={onStop}
          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
          title="Hentikan Auto-Scroll"
          aria-label="Hentikan Auto Scroll"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>
      )}

      {/* Speed switcher dropdown/buttons */}
      <div className="flex items-center gap-0.5 bg-[#FAF9F4] p-1 rounded-xl border border-[#E5E1D5]">
        <FastForward className="w-3 h-3 text-[#84968C] ml-1 mr-0.5" />
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
              speed === s
                ? 'bg-[#126B50] text-white'
                : 'text-[#576B60] hover:text-[#24352B]'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
