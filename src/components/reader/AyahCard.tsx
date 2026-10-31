import React, { memo } from 'react';
import { Play, Pause, Bookmark as BookmarkIcon, Copy, Share2, BookOpen, MessageSquarePlus } from 'lucide-react';
import { Ayah, AppSettings } from '../../types/quran';
import { useToast } from '../common/Toast';

interface AyahCardProps {
  ayah: Ayah;
  nomorSurat: number;
  namaSuratLatin: string;
  settings: AppSettings;
  isBookmarked: boolean;
  hasNote: boolean;
  isPlayingAudio: boolean;
  isHighlighted?: boolean;
  onPlayAudio: (ayah: Ayah) => void;
  onToggleBookmark: (ayah: Ayah) => void;
  onOpenNote: (ayah: Ayah) => void;
  onOpenTafsir: (nomorAyat: number) => void;
}

const FONT_SIZE_ARABIC_MAP = {
  sm: 'text-xl sm:text-2xl leading-[2.2]',
  md: 'text-2xl sm:text-3xl leading-[2.3]',
  lg: 'text-3xl sm:text-4xl leading-[2.4]',
  xl: 'text-4xl sm:text-5xl leading-[2.5]',
  '2xl': 'text-5xl sm:text-6xl leading-[2.6]',
};

const FONT_SIZE_LATIN_MAP = {
  sm: 'text-xs leading-relaxed',
  md: 'text-sm leading-relaxed',
  lg: 'text-base leading-relaxed',
};

export const AyahCard: React.FC<AyahCardProps> = memo(({
  ayah,
  nomorSurat,
  namaSuratLatin,
  settings,
  isBookmarked,
  hasNote,
  isPlayingAudio,
  isHighlighted = false,
  onPlayAudio,
  onToggleBookmark,
  onOpenNote,
  onOpenTafsir,
}) => {
  const { showToast } = useToast();

  const handleCopy = async () => {
    const textToCopy = `${ayah.teksArab}\n\n"${ayah.teksIndonesia}" (QS. ${namaSuratLatin}: ${ayah.nomorAyat})`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`Ayat ${ayah.nomorAyat} berhasil disalin ke clipboard!`);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Ayat ${ayah.nomorAyat} berhasil disalin!`);
      }
    } catch {
      showToast('Gagal menyalin teks ayat.', 'error');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `QS. ${namaSuratLatin} Ayat ${ayah.nomorAyat}`,
      text: `${ayah.teksArab}\n\n"${ayah.teksIndonesia}"\n\n(QS. ${namaSuratLatin} [${nomorSurat}]: ${ayah.nomorAyat})`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const arabicSizeClass = FONT_SIZE_ARABIC_MAP[settings.arabicFontSize] || FONT_SIZE_ARABIC_MAP.lg;
  const latinSizeClass = FONT_SIZE_LATIN_MAP[settings.latinFontSize] || FONT_SIZE_LATIN_MAP.md;

  return (
    <article
      id={`ayah-${ayah.nomorAyat}`}
      className={`p-5 sm:p-6 bg-white rounded-2xl border transition-all duration-300 ${
        isHighlighted
          ? 'border-[#126B50] ring-2 ring-[#126B50]/20 bg-[#FAF9F4]'
          : 'border-[#E5E1D5] hover:border-slate-300'
      }`}
    >
      {/* Top Header: Number and Action Buttons */}
      <div className="flex items-center justify-between border-b border-[#FAF9F4] pb-3 mb-4">
        {/* Ayah Number Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FAF9F4] border border-[#E5E1D5] flex items-center justify-center font-bold text-xs text-[#126B50] tabular-nums">
            {ayah.nomorAyat}
          </div>
          <span className="text-[11px] text-[#84968C]">
            {namaSuratLatin} : {ayah.nomorAyat}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Play Audio */}
          <button
            onClick={() => onPlayAudio(ayah)}
            className={`p-2 rounded-lg transition-colors ${
              isPlayingAudio
                ? 'bg-[#126B50] text-white'
                : 'text-[#576B60] hover:text-[#126B50] hover:bg-[#FAF9F4]'
            }`}
            title={isPlayingAudio ? 'Jeda Audio' : 'Putar Audio Ayat'}
            aria-label="Putar Audio Ayat"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(ayah)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-[#126B50] bg-[#126B50]/10'
                : 'text-[#576B60] hover:text-[#126B50] hover:bg-[#FAF9F4]'
            }`}
            title={isBookmarked ? 'Hapus dari Bookmark' : 'Simpan ke Bookmark'}
            aria-label="Bookmark Ayat"
          >
            <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Note / Catatan */}
          <button
            onClick={() => onOpenNote(ayah)}
            className={`p-2 rounded-lg transition-colors ${
              hasNote
                ? 'text-[#B89B58] bg-[#B89B58]/10'
                : 'text-[#576B60] hover:text-[#126B50] hover:bg-[#FAF9F4]'
            }`}
            title={hasNote ? 'Edit Catatan Ayat' : 'Tambah Catatan Pribadi'}
            aria-label="Catatan Ayat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>

          {/* Tafsir */}
          <button
            onClick={() => onOpenTafsir(ayah.nomorAyat)}
            className="p-2 rounded-lg text-[#576B60] hover:text-[#126B50] hover:bg-[#FAF9F4] transition-colors"
            title="Buka Tafsir Ayat Kemenag"
            aria-label="Lihat Tafsir"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-[#576B60] hover:text-[#126B50] hover:bg-[#FAF9F4] transition-colors"
            title="Salin Teks Ayat & Terjemahan"
            aria-label="Salin Teks"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg text-[#576B60] hover:text-[#126B50] hover:bg-[#FAF9F4] transition-colors"
            title="Bagikan Ayat"
            aria-label="Bagikan Ayat"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Arabic Text (Amiri, Right-to-Left, Harakat intact) */}
      <div className="py-2 text-right">
        <p className={`font-arabic text-[#24352B] tracking-normal font-normal ${arabicSizeClass}`}>
          {ayah.teksArab}
        </p>
      </div>

      {/* Latin Transliteration (if enabled in settings) */}
      {settings.showTransliteration && (
        <div className="pt-3 pb-1">
          <p className="text-xs sm:text-sm text-[#126B50] font-medium leading-relaxed italic">
            {ayah.teksLatin}
          </p>
        </div>
      )}

      {/* Indonesian Translation (if enabled in settings) */}
      {settings.showTranslation && (
        <div className="pt-2 text-left">
          <p className={`text-[#576B60] font-normal ${latinSizeClass}`}>
            {ayah.teksIndonesia}
          </p>
        </div>
      )}
    </article>
  );
});
