import React, { useState } from 'react';
import { Type, Volume2, Target, Eye, Database, Check, RefreshCw } from 'lucide-react';
import { AppSettings, ArabicFontSize, LatinFontSize, QARI_LIST } from '../../types/quran';
import { db } from '../../storage/db';
import { useToast } from '../common/Toast';
import { generateBrandTheme } from '../../config/themeGenerator';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const ARABIC_SIZES: { id: ArabicFontSize; label: string; sample: string }[] = [
  { id: 'sm', label: 'Kecil', sample: 'بِسْمِ اللّٰهِ' },
  { id: 'md', label: 'Sedang', sample: 'بِسْمِ اللّٰهِ' },
  { id: 'lg', label: 'Standar', sample: 'بِسْمِ اللّٰهِ' },
  { id: 'xl', label: 'Besar', sample: 'بِسْمِ اللّٰهِ' },
  { id: '2xl', label: 'Sangat Besar', sample: 'بِسْمِ اللّٰهِ' },
];

const LATIN_SIZES: { id: LatinFontSize; label: string }[] = [
  { id: 'sm', label: 'Kecil' },
  { id: 'md', label: 'Standar' },
  { id: 'lg', label: 'Besar' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { showToast } = useToast();
  const brand = generateBrandTheme();
  const cachedSurahsCount = db.getCachedSurahNumbers().length;

  const update = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    db.saveSettings(updated);
    onUpdateSettings(updated);
    showToast('Pengaturan berhasil diperbarui.');
  };

  const handleClearCache = () => {
    try {
      const keys = db.getCachedSurahNumbers();
      for (const k of keys) {
        window.localStorage.removeItem(`equran_surah_cache_${k}`);
      }
      window.localStorage.removeItem('equran_cached_surah_list');
      showToast('Cache offline surat berhasil dibersihkan.');
    } catch {
      showToast('Gagal membersihkan cache.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[#24352B]">
          Pengaturan & Preferensi Membaca
        </h2>
        <p className="text-xs text-[#576B60]">
          Sesuaikan kenyamanan membaca tilawah Anda. Seluruh perubahan disimpan secara persisten.
        </p>
      </div>

      {/* Typography Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E1D5] space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Type className="w-5 h-5 text-[#126B50]" />
          <div>
            <h3 className="text-sm font-bold text-[#24352B]">Ukuran Huruf</h3>
            <p className="text-xs text-[#576B60]">Atur kejelasan huruf Arab dan terjemahan</p>
          </div>
        </div>

        {/* Arabic Font Size */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#24352B] block">
            Ukuran Teks Arab:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ARABIC_SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => update({ arabicFontSize: size.id })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  settings.arabicFontSize === size.id
                    ? 'border-[#126B50] bg-[#126B50]/5 text-[#126B50] font-bold shadow-2xs'
                    : 'border-[#E5E1D5] bg-[#FAF9F4] text-[#576B60] hover:border-slate-300'
                }`}
              >
                <span className="text-xs block mb-1">{size.label}</span>
                <span className="font-arabic text-base block text-[#24352B]">
                  {size.sample}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Latin Translation Font Size */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-[#24352B] block">
            Ukuran Terjemahan & Latin:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LATIN_SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => update({ latinFontSize: size.id })}
                className={`p-2.5 rounded-xl border text-center transition-all text-xs ${
                  settings.latinFontSize === size.id
                    ? 'border-[#126B50] bg-[#126B50]/5 text-[#126B50] font-bold shadow-2xs'
                    : 'border-[#E5E1D5] bg-[#FAF9F4] text-[#576B60] hover:border-slate-300'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visibility & Display Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E1D5] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Eye className="w-5 h-5 text-[#126B50]" />
          <div>
            <h3 className="text-sm font-bold text-[#24352B]">Tampilan Ayat</h3>
            <p className="text-xs text-[#576B60]">Pilih elemen bacaan yang ingin ditampilkan</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-semibold text-[#24352B] block">
              Teks Transliterasi Latin
            </span>
            <span className="text-[11px] text-[#84968C]">
              Membantu membaca pelafalan ayat dalam aksara Latin
            </span>
          </div>
          <button
            onClick={() => update({ showTransliteration: !settings.showTransliteration })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.showTransliteration ? 'bg-[#126B50]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.showTransliteration ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <div>
            <span className="text-xs font-semibold text-[#24352B] block">
              Terjemahan Bahasa Indonesia
            </span>
            <span className="text-[11px] text-[#84968C]">
              Terjemahan resmi Kementerian Agama Republik Indonesia
            </span>
          </div>
          <button
            onClick={() => update({ showTranslation: !settings.showTranslation })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.showTranslation ? 'bg-[#126B50]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.showTranslation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Audio Qari Selection */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E1D5] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Volume2 className="w-5 h-5 text-[#126B50]" />
          <div>
            <h3 className="text-sm font-bold text-[#24352B]">Qari Audio Default</h3>
            <p className="text-xs text-[#576B60]">
              Pilih qari untuk lantunan tilawah per ayat dan per surat
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {QARI_LIST.map((qari) => {
            const isSelected = settings.selectedQari === qari.id;
            return (
              <button
                key={qari.id}
                onClick={() => update({ selectedQari: qari.id })}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#126B50] bg-[#126B50]/5 shadow-2xs'
                    : 'border-[#E5E1D5] bg-[#FAF9F4] hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-[#24352B]">{qari.name}</h4>
                  <span className="text-[10px] text-[#84968C]">{qari.origin}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#126B50]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Tilawah */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E1D5] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Target className="w-5 h-5 text-[#126B50]" />
          <div>
            <h3 className="text-sm font-bold text-[#24352B]">Target Tilawah Harian</h3>
            <p className="text-xs text-[#576B60]">Tentukan target jumlah ayat yang ingin dibaca setiap hari</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[5, 10, 20, 30, 50].map((t) => (
            <button
              key={t}
              onClick={() => update({ dailyReadingTarget: t })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                settings.dailyReadingTarget === t
                  ? 'bg-[#126B50] text-white border-[#126B50]'
                  : 'bg-[#FAF9F4] text-[#576B60] border-[#E5E1D5] hover:border-slate-300'
              }`}
            >
              {t} Ayat
            </button>
          ))}
        </div>
      </div>

      {/* Storage & PWA Stats */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E1D5] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-[#126B50]" />
          <div>
            <h3 className="text-sm font-bold text-[#24352B]">Penyimpanan & Data Offline</h3>
            <p className="text-xs text-[#576B60]">Manajemen cache data surat di browser</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 text-xs text-[#576B60]">
          <div>
            <span className="font-semibold text-[#24352B] block">Surat Tersimpan Offline</span>
            <span className="text-[11px] text-[#84968C]">
              {cachedSurahsCount} surat telah tersimpan untuk akses tanpa koneksi internet
            </span>
          </div>
          {cachedSurahsCount > 0 && (
            <button
              onClick={handleClearCache}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Hapus Cache</span>
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-[#84968C]">
          Aplikasi: {brand.appName} Digital · Sumber Data: eQuran API v2 (Kemenag RI) · Palet Warna: {brand.primary}
        </div>
      </div>
    </div>
  );
};
