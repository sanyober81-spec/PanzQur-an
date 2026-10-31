import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Jika sudah terinstall, sembunyikan tombol
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#126B50] rounded-lg hover:bg-[#0c4d39] transition-colors shadow-sm"
        title="Pasang Aplikasi ke Layar Utama"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#24352B] bg-[#F5F0D9] border border-[#E5E1D5] rounded-lg hover:bg-[#eae4c8] transition-colors"
          title="Panduan Install di iPhone/iPad"
        >
          <Download className="w-3.5 h-3.5 text-[#126B50]" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-[#E5E1D5]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-[#24352B]">Install di iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs text-[#576B60] leading-relaxed">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#FAF9F4]">
                  <Share className="w-4 h-4 text-[#126B50] shrink-0 mt-0.5" />
                  <p>1. Ketuk tombol <strong>Share / Bagikan</strong> di bilah bawah peramban Safari.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#FAF9F4]">
                  <PlusSquare className="w-4 h-4 text-[#126B50] shrink-0 mt-0.5" />
                  <p>2. Gulir ke bawah dan pilih <strong>Add to Home Screen (Tambah ke Layar Utama)</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#FAF9F4]">
                  <Download className="w-4 h-4 text-[#126B50] shrink-0 mt-0.5" />
                  <p>3. Ketuk <strong>Add / Tambah</strong> di pojok kanan atas. eQuran siap dibuka offline!</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#126B50] py-2.5 text-xs font-semibold text-white hover:bg-[#0c4d39] transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
