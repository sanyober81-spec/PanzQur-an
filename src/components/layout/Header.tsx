import React from 'react';
import { Search } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { generateBrandTheme } from '../../config/themeGenerator';

interface HeaderProps {
  currentTab: 'home' | 'surah-list' | 'bookmarks' | 'settings' | 'reader';
  onSelectTab: (tab: 'home' | 'surah-list' | 'bookmarks' | 'settings') => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
}) => {
  const brand = generateBrandTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E1D5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Zone */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer group"
        >
          <img
            src={brand.iconPath}
            alt={brand.appName}
            className="w-9 h-9 rounded-lg object-cover shadow-xs border border-[#126B50]/20"
          />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#24352B] group-hover:text-[#126B50] transition-colors leading-tight">
              {brand.appName}
            </span>
            <span className="text-[11px] text-[#576B60] hidden sm:inline leading-none font-medium">
              Al-Qur'an Digital
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop/Tablet) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#576B60]">
          <button
            onClick={() => onSelectTab('home')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'home'
                ? 'text-[#126B50] border-b-2 border-[#126B50]'
                : 'hover:text-[#24352B]'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onSelectTab('surah-list')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'surah-list'
                ? 'text-[#126B50] border-b-2 border-[#126B50]'
                : 'hover:text-[#24352B]'
            }`}
          >
            Daftar Surat
          </button>
          <button
            onClick={() => onSelectTab('bookmarks')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'bookmarks'
                ? 'text-[#126B50] border-b-2 border-[#126B50]'
                : 'hover:text-[#24352B]'
            }`}
          >
            Bookmark & Catatan
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'settings'
                ? 'text-[#126B50] border-b-2 border-[#126B50]'
                : 'hover:text-[#24352B]'
            }`}
          >
            Pengaturan
          </button>
        </nav>

        {/* Zone 3: Actions (Search + PWA Install) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#576B60] bg-[#FAF9F4] border border-[#E5E1D5] rounded-lg hover:border-[#126B50]/40 hover:text-[#24352B] transition-colors"
            title="Cari Surat atau Ayat"
          >
            <Search className="w-3.5 h-3.5 text-[#126B50]" />
            <span className="hidden sm:inline">Cari Surat / Ayat...</span>
            <kbd className="hidden lg:inline text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
