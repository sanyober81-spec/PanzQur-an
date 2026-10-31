import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Loader2, BookOpen, Layers, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { searchIndex } from '../../services/searchIndex';
import { SearchResultItem } from '../../types/quran';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToResult: (nomorSurat: number, nomorAyat?: number) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToResult,
}) => {
  const [query, setQuery] = useState('');
  const [progress, setProgress] = useState(searchIndex.getProgress());

  useEffect(() => {
    const unsub = searchIndex.subscribe((p) => {
      setProgress(p);
    });
    return unsub;
  }, []);

  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults: SearchResultItem[] = useMemo(() => {
    if (!query.trim()) return [];
    return searchIndex.search(query, 60);
  }, [query, progress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto pt-16 sm:pt-20">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E1D5] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-[#E5E1D5] bg-[#FAF9F4]">
          <Search className="w-5 h-5 text-[#126B50] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari surat, ayat (contoh: 36:5), atau kata dalam terjemahan..."
            className="w-full bg-transparent text-sm sm:text-base text-[#24352B] placeholder:text-[#84968C] focus:outline-hidden"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-400">
              ESC
            </kbd>
          )}
          <button
            onClick={onClose}
            className="sm:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Index Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] text-[#576B60]">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#126B50]" />
            <span>
              Indeks aktif: <strong>{progress.indexedSurahs}</strong> dari {progress.totalSurahs} surat ({progress.indexedAyahs} ayat terindeks)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {progress.isRunning ? (
              <span className="flex items-center gap-1.5 text-[#126B50] font-semibold">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Sedang Mengindeks...</span>
              </span>
            ) : progress.indexedSurahs < 114 ? (
              <button
                onClick={() => searchIndex.startProgressiveIndexing(4)}
                className="text-[#126B50] font-bold hover:underline"
              >
                + Indeks Lebih Banyak
              </button>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>114 Surat Lengkap</span>
              </span>
            )}
          </div>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {!query.trim() ? (
            <div className="py-12 text-center text-xs text-[#576B60] space-y-3">
              <p className="font-semibold text-[#24352B]">Tips Pencarian Cepat:</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                <button
                  onClick={() => setQuery('Yasin')}
                  className="px-2.5 py-1 bg-[#FAF9F4] hover:bg-[#F5F0D9] rounded-lg border border-[#E5E1D5] text-[#126B50]"
                >
                  "Yasin" (Nama Surat)
                </button>
                <button
                  onClick={() => setQuery('18:10')}
                  className="px-2.5 py-1 bg-[#FAF9F4] hover:bg-[#F5F0D9] rounded-lg border border-[#E5E1D5] text-[#126B50]"
                >
                  "18:10" (Surat & Nomor Ayat)
                </button>
                <button
                  onClick={() => setQuery('kesabaran')}
                  className="px-2.5 py-1 bg-[#FAF9F4] hover:bg-[#F5F0D9] rounded-lg border border-[#E5E1D5] text-[#126B50]"
                >
                  "kesabaran" (Kata Terjemahan)
                </button>
                <button
                  onClick={() => setQuery('cahaya')}
                  className="px-2.5 py-1 bg-[#FAF9F4] hover:bg-[#F5F0D9] rounded-lg border border-[#E5E1D5] text-[#126B50]"
                >
                  "cahaya" (Makna Terjemahan)
                </button>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#576B60] space-y-2">
              <p className="font-semibold text-[#24352B]">
                Tidak ditemukan hasil untuk "{query}"
              </p>
              <p className="max-w-xs mx-auto text-[#84968C]">
                Coba gunakan kata kunci lain, nomor surat, atau klik "+ Indeks Lebih Banyak" di atas untuk memperluas pencarian ayat.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((result, idx) => (
                <div
                  key={`${result.type}-${result.nomorSurat}-${result.nomorAyat || 0}-${idx}`}
                  onClick={() => {
                    onNavigateToResult(result.nomorSurat, result.nomorAyat);
                    onClose();
                  }}
                  className="p-3.5 bg-white rounded-xl border border-[#E5E1D5] hover:border-[#126B50] hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#126B50]">
                        QS. {result.namaSuratLatin}
                        {result.nomorAyat ? ` : Ayat ${result.nomorAyat}` : ` (Surat ke-${result.nomorSurat})`}
                      </span>
                      <span className="text-[10px] text-[#84968C]">
                        {result.matchField === 'nama'
                          ? 'Cocok Nama'
                          : result.matchField === 'arti'
                          ? 'Cocok Arti'
                          : result.matchField === 'nomor'
                          ? 'Cocok Nomor'
                          : 'Cocok Terjemahan'}
                      </span>
                    </div>

                    {result.teksArab && (
                      <p className="font-arabic text-sm text-[#24352B] text-right line-clamp-1 mb-1">
                        {result.teksArab}
                      </p>
                    )}

                    <p className="text-xs text-[#576B60] line-clamp-2 leading-relaxed">
                      {result.snippet}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#126B50] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
