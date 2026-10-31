import React, { useState, useEffect } from 'react';
import { X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { quranApi } from '../../services/quranApi';
import { SurahTafsirData, TafsirAyahItem } from '../../types/quran';

interface TafsirModalProps {
  nomorSurat: number;
  namaSuratLatin: string;
  initialAyat: number;
  totalAyat: number;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  nomorSurat,
  namaSuratLatin,
  initialAyat,
  totalAyat,
  onClose,
}) => {
  const [selectedAyat, setSelectedAyat] = useState<number>(initialAyat);
  const [tafsirData, setTafsirData] = useState<SurahTafsirData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTafsir = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await quranApi.getSuratTafsir(nomorSurat);
        if (isMounted) {
          setTafsirData(res);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError((err as Error).message || 'Gagal memuat tafsir surat ini.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTafsir();
    return () => {
      isMounted = false;
    };
  }, [nomorSurat]);

  const currentTafsir: TafsirAyahItem | undefined = tafsirData?.tafsir?.find(
    (t) => t.ayat === selectedAyat
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E1D5] flex flex-col max-h-[85vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E1D5] bg-[#FAF9F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#126B50]/10 text-[#126B50] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#24352B]">
                Tafsir Kemenag RI
              </h3>
              <p className="text-xs text-[#576B60]">
                QS. {namaSuratLatin} : Ayat {selectedAyat} dari {totalAyat}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ayah Navigation Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-white border-b border-slate-100">
          <button
            onClick={() => setSelectedAyat((prev) => Math.max(1, prev - 1))}
            disabled={selectedAyat <= 1}
            className="flex items-center gap-1 text-xs font-semibold text-[#126B50] disabled:text-slate-300 disabled:pointer-events-none hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Ayat Sebelumnya</span>
          </button>

          <span className="text-xs font-bold text-[#24352B] bg-[#FAF9F4] px-3 py-1 rounded-full border border-[#E5E1D5] tabular-nums">
            Ayat {selectedAyat}
          </span>

          <button
            onClick={() => setSelectedAyat((prev) => Math.min(totalAyat, prev + 1))}
            disabled={selectedAyat >= totalAyat}
            className="flex items-center gap-1 text-xs font-semibold text-[#126B50] disabled:text-slate-300 disabled:pointer-events-none hover:underline"
          >
            <span>Ayat Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-sm leading-relaxed text-[#24352B]">
          {loading ? (
            <div className="space-y-4 py-8 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-5/6" />
              <div className="h-4 bg-slate-100 rounded w-4/5" />
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs text-center">
              {error}
            </div>
          ) : currentTafsir ? (
            <div className="space-y-4 whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#35483d]">
              {currentTafsir.teks}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              Tafsir untuk ayat ini belum tersedia dari sumber Kemenag.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E5E1D5] bg-[#FAF9F4] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#24352B] bg-white border border-[#E5E1D5] rounded-xl hover:bg-slate-50 transition-colors"
          >
            Tutup Tafsir
          </button>
        </div>
      </div>
    </div>
  );
};
