import React from 'react';
import { Play, Pause } from 'lucide-react';
import { SurahListItem } from '../../types/quran';

interface SurahCardProps {
  surah: SurahListItem;
  onSelect: (nomor: number) => void;
  onPlayFullAudio: (surah: SurahListItem) => void;
  isPlayingThisAudio: boolean;
}

export const SurahCard: React.FC<SurahCardProps> = ({
  surah,
  onSelect,
  onPlayFullAudio,
  isPlayingThisAudio,
}) => {
  return (
    <div
      onClick={() => onSelect(surah.nomor)}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E5E1D5] hover:border-[#126B50]/40 hover:shadow-xs transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Nomor Surat Badge */}
        <div className="w-9 h-9 rounded-lg bg-[#FAF9F4] border border-[#E5E1D5] flex items-center justify-center font-bold text-xs text-[#126B50] tabular-nums shrink-0 group-hover:bg-[#126B50] group-hover:text-white transition-colors">
          {surah.nomor}
        </div>

        {/* Info Surat */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#24352B] group-hover:text-[#126B50] transition-colors truncate">
              {surah.namaLatin}
            </h3>
            <span className="text-[10px] text-[#84968C] hidden sm:inline">·</span>
            <span className="text-[10px] text-[#84968C] hidden sm:inline">
              {surah.tempatTurun}
            </span>
          </div>
          <p className="text-xs text-[#576B60] truncate">
            {surah.arti} · <span className="tabular-nums">{surah.jumlahAyat}</span> Ayat
          </p>
        </div>
      </div>

      {/* Arabic Name & Audio Button */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayFullAudio(surah);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isPlayingThisAudio
              ? 'bg-[#126B50] text-white'
              : 'text-[#576B60] hover:text-[#126B50] hover:bg-[#FAF9F4]'
          }`}
          title={isPlayingThisAudio ? 'Jeda Audio' : `Putar Audio Surat ${surah.namaLatin}`}
        >
          {isPlayingThisAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <span className="font-arabic text-lg sm:text-xl font-bold text-[#126B50] text-right min-w-[70px]">
          {surah.nama}
        </span>
      </div>
    </div>
  );
};
