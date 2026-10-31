import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, Info, AlertCircle, Share2, Volume2 } from 'lucide-react';
import { SurahDetail, Ayah, AppSettings } from '../../types/quran';
import { quranApi } from '../../services/quranApi';
import { db } from '../../storage/db';
import { audioService, AudioPlayerState } from '../../services/audioService';
import { searchIndex } from '../../services/searchIndex';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { AyahCard } from './AyahCard';
import { AutoScrollControl } from './AutoScrollControl';
import { TafsirModal } from './TafsirModal';
import { NoteModal } from './NoteModal';
import { QuickAyahJumper } from './QuickAyahJumper';
import { AyahReaderSkeleton } from '../common/SkeletonLoader';
import { ErrorState } from '../common/ErrorState';
import { useToast } from '../common/Toast';

interface SurahReaderViewProps {
  nomorSurat: number;
  targetAyat?: number;
  settings: AppSettings;
  onBack: () => void;
  onNavigateSurah: (nomor: number, targetAyat?: number) => void;
}

export const SurahReaderView: React.FC<SurahReaderViewProps> = ({
  nomorSurat,
  targetAyat,
  settings,
  onBack,
  onNavigateSurah,
}) => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromOfflineCache, setIsFromOfflineCache] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  // Modals state
  const [activeTafsirAyat, setActiveTafsirAyat] = useState<number | null>(null);
  const [activeNoteAyah, setActiveNoteAyah] = useState<Ayah | null>(null);

  // Audio & bookmarks state
  const [audioState, setAudioState] = useState<AudioPlayerState>(audioService.getState());
  const [bookmarkedAyahIds, setBookmarkedAyahIds] = useState<Set<string>>(new Set());

  // Auto-scroll
  const autoScroll = useAutoScroll();
  const { showToast } = useToast();

  const refreshedBookmarks = useCallback(() => {
    const list = db.getBookmarks();
    setBookmarkedAyahIds(new Set(list.map((b) => b.id)));
  }, []);

  useEffect(() => {
    refreshedBookmarks();
  }, [refreshedBookmarks]);

  // Audio subscription
  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  // Fetch Surah Detail
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    autoScroll.stop();

    const fetchSurah = async () => {
      try {
        const { data, isFromCache } = await quranApi.getSuratDetail(nomorSurat);
        if (isMounted) {
          setSurah(data);
          setIsFromOfflineCache(isFromCache);
          searchIndex.indexSurahDirect(data);

          // Update last read position
          db.saveLastRead({
            nomorSurat: data.nomor,
            namaSuratLatin: data.namaLatin,
            nomorAyat: targetAyat || 1,
            totalAyat: data.jumlahAyat,
            timestamp: Date.now(),
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError((err as Error).message || 'Gagal memuat surat.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSurah();

    return () => {
      isMounted = false;
      autoScroll.stop();
    };
  }, [nomorSurat]);

  // Scroll to target ayat if provided
  useEffect(() => {
    if (!loading && surah && targetAyat) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyat}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }, [loading, surah, targetAyat]);

  // Setup Ayah sequential audio playback
  useEffect(() => {
    if (!surah) return;
    audioService.setOnAyahEnded(() => {
      const currentTrack = audioService.getState().track;
      if (currentTrack && currentTrack.type === 'ayah' && currentTrack.nomorAyat) {
        const nextAyatNumber = currentTrack.nomorAyat + 1;
        const nextAyah = surah.ayat.find((a) => a.nomorAyat === nextAyatNumber);
        if (nextAyah) {
          audioService.playAyah(
            surah.nomor,
            surah.namaLatin,
            nextAyah.nomorAyat,
            nextAyah.audio,
            settings.selectedQari
          );
          // Highlight and scroll into view gently
          const el = document.getElementById(`ayah-${nextAyah.nomorAyat}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    });

    return () => {
      audioService.setOnAyahEnded(null);
    };
  }, [surah, settings.selectedQari]);

  const handlePlayAyahAudio = (ayah: Ayah) => {
    if (!surah) return;
    const isThisPlaying =
      audioState.isPlaying &&
      audioState.track?.type === 'ayah' &&
      audioState.track.nomorSurat === surah.nomor &&
      audioState.track.nomorAyat === ayah.nomorAyat;

    if (isThisPlaying) {
      audioService.pause();
    } else {
      audioService.playAyah(
        surah.nomor,
        surah.namaLatin,
        ayah.nomorAyat,
        ayah.audio,
        settings.selectedQari
      );
    }
  };

  const handlePlayFullSurahAudio = () => {
    if (!surah) return;
    const isThisPlaying =
      audioState.isPlaying &&
      audioState.track?.type === 'surah' &&
      audioState.track.nomorSurat === surah.nomor;

    if (isThisPlaying) {
      audioService.pause();
    } else {
      audioService.playFullSurah(
        surah.nomor,
        surah.namaLatin,
        surah.audioFull,
        settings.selectedQari
      );
    }
  };

  const handleToggleBookmark = (ayah: Ayah) => {
    if (!surah) return;
    const key = `${surah.nomor}:${ayah.nomorAyat}`;
    if (bookmarkedAyahIds.has(key)) {
      db.removeBookmark(key);
      showToast(`Ayat ${ayah.nomorAyat} dihapus dari bookmark.`);
    } else {
      db.saveBookmark({
        id: key,
        nomorSurat: surah.nomor,
        namaSuratLatin: surah.namaLatin,
        nomorAyat: ayah.nomorAyat,
        teksArab: ayah.teksArab,
        teksIndonesia: ayah.teksIndonesia,
        timestamp: Date.now(),
      });
      showToast(`Ayat ${ayah.nomorAyat} berhasil disimpan di bookmark!`);
    }
    refreshedBookmarks();
  };

  const handleJumpToAyat = (ayahNum: number) => {
    const el = document.getElementById(`ayah-${ayahNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (surah) {
        db.saveLastRead({
          nomorSurat: surah.nomor,
          namaSuratLatin: surah.namaLatin,
          nomorAyat: ayahNum,
          totalAyat: surah.jumlahAyat,
          timestamp: Date.now(),
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-[#126B50] rounded-xl hover:bg-white border border-[#E5E1D5]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <AyahReaderSkeleton />
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[#126B50] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Surat</span>
        </button>
        <ErrorState
          message={error || 'Surat tidak ditemukan.'}
          onRetry={() => onNavigateSurah(nomorSurat, targetAyat)}
        />
      </div>
    );
  }

  const isFullSurahPlaying =
    audioState.isPlaying &&
    audioState.track?.type === 'surah' &&
    audioState.track.nomorSurat === surah.nomor;

  return (
    <div className="space-y-6 pb-24">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E1D5]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-[#576B60] hover:text-[#126B50] hover:bg-[#FAF9F4] rounded-xl border border-[#E5E1D5] transition-colors"
            title="Kembali ke Daftar Surat"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#24352B] leading-tight">
              {surah.namaLatin}
            </h1>
            <p className="text-[11px] text-[#576B60]">
              Surat ke-{surah.nomor} · {surah.arti} · {surah.jumlahAyat} Ayat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Ayah Jumper */}
          <QuickAyahJumper
            totalAyat={surah.jumlahAyat}
            currentAyat={targetAyat || 1}
            onJumpToAyat={handleJumpToAyat}
          />

          {/* Play Full Surah Audio */}
          <button
            onClick={handlePlayFullSurahAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isFullSurahPlaying
                ? 'bg-[#126B50] text-white shadow-xs'
                : 'bg-[#FAF9F4] text-[#126B50] hover:bg-[#F5F0D9] border border-[#E5E1D5]'
            }`}
            title="Dengarkan Lantunan Full Surat"
          >
            {isFullSurahPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda Tilawah</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 ml-0.5" />
                <span className="hidden sm:inline">Putar Surat</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Surah Banner & Information */}
      <div className="bg-[#126B50] text-white rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-xs">
        <span className="font-arabic text-3xl sm:text-4xl block mb-2 text-[#F5F0D9]">
          {surah.nama}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-white">
          {surah.namaLatin}
        </h2>
        <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto">
          {surah.arti} · {surah.tempatTurun} · {surah.jumlahAyat} Ayat
        </p>

        {/* Offline indicator if served from cached storage */}
        {isFromOfflineCache && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-3 bg-white/10 rounded-full text-[10px] text-amber-200">
            <span>Mode Offline · Membaca dari data tersimpan</span>
          </div>
        )}

        {/* Bismillah Header (except for Surah 1 and Surah 9 At-Taubah) */}
        {surah.nomor !== 1 && surah.nomor !== 9 && (
          <div className="mt-6 pt-6 border-t border-white/15">
            <p className="font-arabic text-2xl sm:text-3xl text-[#F5F0D9]">
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
          </div>
        )}
      </div>

      {/* Description toggle */}
      {surah.deskripsi && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E1D5]">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#126B50]">
              <Info className="w-4 h-4" />
              <span>Deskripsi & Asbabun Nuzul {surah.namaLatin}</span>
            </div>
            <span className="text-xs text-[#84968C]">
              {showDescription ? 'Tutup' : 'Lihat Selengkapnya'}
            </span>
          </button>

          {showDescription && (
            <div
              className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-[#576B60] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: surah.deskripsi }}
            />
          )}
        </div>
      )}

      {/* List of Ayahs */}
      <div className="space-y-4">
        {surah.ayat.map((ayah) => {
          const key = `${surah.nomor}:${ayah.nomorAyat}`;
          const isBookmarked = bookmarkedAyahIds.has(key);
          const hasNote = Boolean(db.getBookmark(surah.nomor, ayah.nomorAyat)?.note);
          const isPlayingThisAudio =
            audioState.isPlaying &&
            audioState.track?.type === 'ayah' &&
            audioState.track.nomorSurat === surah.nomor &&
            audioState.track.nomorAyat === ayah.nomorAyat;
          const isHighlighted = targetAyat === ayah.nomorAyat;

          return (
            <AyahCard
              key={ayah.nomorAyat}
              ayah={ayah}
              nomorSurat={surah.nomor}
              namaSuratLatin={surah.namaLatin}
              settings={settings}
              isBookmarked={isBookmarked}
              hasNote={hasNote}
              isPlayingAudio={isPlayingThisAudio}
              isHighlighted={isHighlighted}
              onPlayAudio={handlePlayAyahAudio}
              onToggleBookmark={handleToggleBookmark}
              onOpenNote={(a) => setActiveNoteAyah(a)}
              onOpenTafsir={(num) => setActiveTafsirAyat(num)}
            />
          );
        })}
      </div>

      {/* Bottom Surah Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E5E1D5]">
        {surah.suratSebelumnya ? (
          <button
            onClick={() => onNavigateSurah(surah.suratSebelumnya ? (surah.suratSebelumnya as any).nomor : 1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E1D5] rounded-xl hover:border-[#126B50] text-xs font-semibold text-[#24352B] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#126B50]" />
            <div className="text-left">
              <span className="text-[10px] text-[#84968C] block leading-none">Surat Sebelumnya</span>
              <span className="font-bold">{(surah.suratSebelumnya as any).namaLatin}</span>
            </div>
          </button>
        ) : (
          <div />
        )}

        {surah.suratSelanjutnya ? (
          <button
            onClick={() => onNavigateSurah(surah.suratSelanjutnya ? (surah.suratSelanjutnya as any).nomor : 114)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E1D5] rounded-xl hover:border-[#126B50] text-xs font-semibold text-[#24352B] transition-colors"
          >
            <div className="text-right">
              <span className="text-[10px] text-[#84968C] block leading-none">Surat Berikutnya</span>
              <span className="font-bold">{(surah.suratSelanjutnya as any).namaLatin}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#126B50]" />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Auto-Scroll Floating Widget */}
      <AutoScrollControl
        isActive={autoScroll.isActive}
        isPaused={autoScroll.isPaused}
        speed={autoScroll.speed}
        onToggle={autoScroll.toggle}
        onStop={autoScroll.stop}
        onSpeedChange={autoScroll.setSpeed}
      />

      {/* Tafsir Modal */}
      {activeTafsirAyat !== null && (
        <TafsirModal
          nomorSurat={surah.nomor}
          namaSuratLatin={surah.namaLatin}
          initialAyat={activeTafsirAyat}
          totalAyat={surah.jumlahAyat}
          onClose={() => setActiveTafsirAyat(null)}
        />
      )}

      {/* Personal Note Modal */}
      {activeNoteAyah !== null && (
        <NoteModal
          ayah={activeNoteAyah}
          nomorSurat={surah.nomor}
          namaSuratLatin={surah.namaLatin}
          onClose={() => setActiveNoteAyah(null)}
          onSaved={refreshedBookmarks}
        />
      )}
    </div>
  );
};
