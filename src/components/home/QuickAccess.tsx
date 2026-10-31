import React from 'react';
import { BookOpen, BookmarkCheck, Search, Sliders } from 'lucide-react';

interface QuickAccessProps {
  onSelectSurah: (nomor: number) => void;
  onOpenSurahList: () => void;
  onOpenBookmarks: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

const POPULAR_SURAHS = [
  { nomor: 18, name: 'Al-Kahf', ayat: 110, reason: 'Sunnah Jumat' },
  { nomor: 36, name: 'Yasin', ayat: 83, reason: 'Qalbul Qur\'an' },
  { nomor: 67, name: 'Al-Mulk', ayat: 30, reason: 'Pelindung Kubur' },
  { nomor: 56, name: 'Al-Waqi\'ah', ayat: 96, reason: 'Keberkahan' },
  { nomor: 55, name: 'Ar-Rahman', ayat: 78, reason: 'Nikmat Allah' },
  { nomor: 2, name: 'Al-Baqarah', ayat: 286, reason: 'Puncak Qur\'an' },
];

export const QuickAccess: React.FC<QuickAccessProps> = ({
  onSelectSurah,
  onOpenSurahList,
  onOpenBookmarks,
  onOpenSearch,
  onOpenSettings,
}) => {
  return (
    <div className="space-y-6">
      {/* 4 Feature Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenSurahList}
          className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E5E1D5] hover:border-[#126B50]/30 hover:shadow-xs transition text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#126B50]/10 text-[#126B50] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#24352B]">114 Surat</h4>
            <span className="text-[10px] text-[#576B60]">Daftar Lengkap</span>
          </div>
        </button>

        <button
          onClick={onOpenBookmarks}
          className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E5E1D5] hover:border-[#126B50]/30 hover:shadow-xs transition text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#126B50]/10 text-[#126B50] flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#24352B]">Bookmark</h4>
            <span className="text-[10px] text-[#576B60]">Ayat & Catatan</span>
          </div>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E5E1D5] hover:border-[#126B50]/30 hover:shadow-xs transition text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#126B50]/10 text-[#126B50] flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#24352B]">Pencarian</h4>
            <span className="text-[10px] text-[#576B60]">Surat & Terjemahan</span>
          </div>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E5E1D5] hover:border-[#126B50]/30 hover:shadow-xs transition text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#126B50]/10 text-[#126B50] flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#24352B]">Pengaturan</h4>
            <span className="text-[10px] text-[#576B60]">Font & Preferensi</span>
          </div>
        </button>
      </div>

      {/* Popular Surah Quick Jumps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#576B60] tracking-wide">
            Surat Sering Dibaca
          </h3>
          <button
            onClick={onOpenSurahList}
            className="text-xs font-medium text-[#126B50] hover:underline"
          >
            Lihat Semua (114)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {POPULAR_SURAHS.map((surah) => (
            <button
              key={surah.nomor}
              onClick={() => onSelectSurah(surah.nomor)}
              className="flex flex-col p-3 bg-white rounded-xl border border-[#E5E1D5] hover:border-[#126B50] hover:shadow-xs transition text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[#126B50] tabular-nums">
                  #{surah.nomor}
                </span>
                <span className="text-[10px] text-[#84968C]">{surah.ayat} ayat</span>
              </div>
              <span className="text-xs font-bold text-[#24352B] group-hover:text-[#126B50] transition-colors truncate">
                {surah.name}
              </span>
              <span className="text-[10px] text-[#576B60] truncate">{surah.reason}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
