import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Volume2 } from 'lucide-react';
import { SurahListItem } from '../../types/quran';
import { quranApi } from '../../services/quranApi';
import { audioService, AudioPlayerState } from '../../services/audioService';
import { SurahCard } from './SurahCard';
import { SurahListSkeleton } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { searchIndex } from '../../services/searchIndex';
import { db } from '../../storage/db';

interface SurahListProps {
  onSelectSurah: (nomor: number) => void;
}

export const SurahList: React.FC<SurahListProps> = ({ onSelectSurah }) => {
  const [surahs, setSurahs] = useState<SurahListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mekah' | 'madinah'>('all');
  const [audioState, setAudioState] = useState<AudioPlayerState>(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  const loadSurahs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quranApi.getAllSurat();
      setSurahs(data);
      // Update global search index surah list
      searchIndex.setSurahList(data);
    } catch (err: unknown) {
      const message = (err as Error).message || 'Gagal memuat daftar 114 surat.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurahs();
  }, []);

  // Filter surahs based on search query and place of revelation
  const filteredSurahs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return surahs.filter((surah) => {
      // Revelation filter
      if (selectedFilter === 'mekah' && surah.tempatTurun.toLowerCase() !== 'mekah') return false;
      if (selectedFilter === 'madinah' && surah.tempatTurun.toLowerCase() !== 'madinah') return false;

      // Query filter
      if (!query) return true;
      const matchNumber = surah.nomor.toString() === query;
      const matchLatin = surah.namaLatin.toLowerCase().includes(query);
      const matchArti = surah.arti.toLowerCase().includes(query);
      const matchArab = surah.nama.includes(query);
      return matchNumber || matchLatin || matchArti || matchArab;
    });
  }, [surahs, searchQuery, selectedFilter]);

  const handlePlayFullAudio = (surah: SurahListItem) => {
    const settings = db.getSettings();
    if (audioState.isPlaying && audioState.track?.type === 'surah' && audioState.track.nomorSurat === surah.nomor) {
      audioService.pause();
    } else {
      audioService.playFullSurah(surah.nomor, surah.namaLatin, surah.audioFull, settings.selectedQari);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search Bar & Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E1D5] space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#84968C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama surat, nomor (1-114), atau arti..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#FAF9F4] text-xs sm:text-sm text-[#24352B] rounded-xl border border-[#E5E1D5] focus:outline-hidden focus:border-[#126B50] focus:ring-1 focus:ring-[#126B50]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs (Interactive buttons) */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F4] rounded-lg border border-[#E5E1D5]">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-white text-[#126B50] shadow-xs'
                  : 'text-[#576B60] hover:text-[#24352B]'
              }`}
            >
              Semua (114)
            </button>
            <button
              onClick={() => setSelectedFilter('mekah')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                selectedFilter === 'mekah'
                  ? 'bg-white text-[#126B50] shadow-xs'
                  : 'text-[#576B60] hover:text-[#24352B]'
              }`}
            >
              Makkiyyah
            </button>
            <button
              onClick={() => setSelectedFilter('madinah')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                selectedFilter === 'madinah'
                  ? 'bg-white text-[#126B50] shadow-xs'
                  : 'text-[#576B60] hover:text-[#24352B]'
              }`}
            >
              Madaniyyah
            </button>
          </div>

          <span className="text-[11px] text-[#84968C] hidden sm:inline tabular-nums">
            Menampilkan {filteredSurahs.length} Surat
          </span>
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <SurahListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadSurahs} />
      ) : filteredSurahs.length === 0 ? (
        <EmptyState
          icon="search"
          title="Surat Tidak Ditemukan"
          description={`Tidak ada surat yang cocok dengan kata kunci "${searchQuery}". Coba gunakan nomor atau nama latin surat.`}
          actionLabel="Hapus Pencarian"
          onAction={() => {
            setSearchQuery('');
            setSelectedFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSurahs.map((surah) => {
            const isPlayingThis =
              audioState.isPlaying &&
              audioState.track?.type === 'surah' &&
              audioState.track.nomorSurat === surah.nomor;

            return (
              <SurahCard
                key={surah.nomor}
                surah={surah}
                onSelect={onSelectSurah}
                onPlayFullAudio={handlePlayFullAudio}
                isPlayingThisAudio={isPlayingThis}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
