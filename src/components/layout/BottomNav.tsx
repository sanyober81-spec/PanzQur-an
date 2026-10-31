import React from 'react';
import { Home, BookOpen, Search, BookmarkCheck, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'surah-list' | 'bookmarks' | 'settings' | 'reader';
  onSelectTab: (tab: 'home' | 'surah-list' | 'bookmarks' | 'settings') => void;
  onOpenSearch: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E1D5] pb-safe">
      <div className="grid grid-cols-5 items-center h-14">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'home' ? 'text-[#126B50]' : 'text-[#84968C] hover:text-[#24352B]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Beranda</span>
        </button>

        <button
          onClick={() => onSelectTab('surah-list')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'surah-list' || currentTab === 'reader'
              ? 'text-[#126B50]'
              : 'text-[#84968C] hover:text-[#24352B]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Surat</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center h-full text-[#84968C] hover:text-[#126B50] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#126B50]/10 flex items-center justify-center text-[#126B50]">
            <Search className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 text-[#126B50]">Cari</span>
        </button>

        <button
          onClick={() => onSelectTab('bookmarks')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'bookmarks' ? 'text-[#126B50]' : 'text-[#84968C] hover:text-[#24352B]'
          }`}
        >
          <BookmarkCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Bookmark</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'settings' ? 'text-[#126B50]' : 'text-[#84968C] hover:text-[#24352B]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Setelan</span>
        </button>
      </div>
    </nav>
  );
};
