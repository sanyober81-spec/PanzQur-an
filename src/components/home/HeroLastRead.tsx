import React from 'react';
import { Bookmark, ArrowRight, BookMarked, Sparkles } from 'lucide-react';
import { LastReadPosition } from '../../types/quran';
import { generateBrandTheme } from '../../config/themeGenerator';

interface HeroLastReadProps {
  lastRead: LastReadPosition | null;
  onContinueReading: (nomorSurat: number, targetAyat?: number) => void;
  onExploreSurah: () => void;
}

export const HeroLastRead: React.FC<HeroLastReadProps> = ({
  lastRead,
  onContinueReading,
  onExploreSurah,
}) => {
  const brand = generateBrandTheme();

  if (!lastRead) {
    return (
      <div className="bg-[#126B50] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative gold motif */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-[#F5F0D9] mb-2 tracking-wide">
            <Sparkles className="w-4 h-4 text-[#B89B58]" />
            <span>Selamat Datang di {brand.appName}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">
            {brand.tagline}
          </h2>
          <p className="text-sm text-white/80 mb-6 leading-relaxed">
            Mulai tilawah Al-Qur'an hari ini dengan teks Arab berharakat jernih, audio tilawah qari ternama, terjemahan resmi Kemenag RI, dan tafsir lengkap.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onContinueReading(1, 1)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#126B50] bg-[#F5F0D9] hover:bg-white rounded-xl transition-colors shadow-xs"
            >
              <span>Mulai dari Al-Fatihah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onExploreSurah}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors"
            >
              <span>Jelajahi 114 Surat</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((lastRead.nomorAyat / (lastRead.totalAyat || 1)) * 100));

  return (
    <div className="bg-[#126B50] text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2 max-w-md">
          <div className="flex items-center gap-2 text-xs font-medium text-[#F5F0D9] tracking-wide">
            <BookMarked className="w-4 h-4 text-[#B89B58]" />
            <span>Terakhir Dibaca</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-baseline gap-2">
            <span>{lastRead.namaSuratLatin}</span>
            <span className="text-sm font-normal text-white/80">
              Ayat {lastRead.nomorAyat} dari {lastRead.totalAyat}
            </span>
          </h2>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden my-2 max-w-xs">
            <div
              className="bg-[#B89B58] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-white/70">
            Progress surat: {progressPercent}% · Posisi tersimpan otomatis
          </p>
        </div>

        <button
          onClick={() => onContinueReading(lastRead.nomorSurat, lastRead.nomorAyat)}
          className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-[#126B50] bg-[#F5F0D9] hover:bg-white rounded-xl transition-all shadow-xs shrink-0 active:scale-98"
        >
          <span>Lanjutkan Membaca</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
