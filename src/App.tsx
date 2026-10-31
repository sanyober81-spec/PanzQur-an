import React, { useState, useEffect } from 'react';
import { applyThemeTokens } from './config/themeGenerator';
import { db } from './storage/db';
import { AppSettings, LastReadPosition } from './types/quran';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { HeroLastRead } from './components/home/HeroLastRead';
import { TilawahTargetCard } from './components/home/TilawahTargetCard';
import { QuickAccess } from './components/home/QuickAccess';
import { PartnerLogoMarquee } from './components/home/PartnerLogoMarquee';
import { SurahList } from './components/surah/SurahList';
import { SurahReaderView } from './components/reader/SurahReaderView';
import { BookmarkListView } from './components/bookmarks/BookmarkListView';
import { SettingsView } from './components/settings/SettingsView';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { MiniAudioPlayer } from './components/reader/MiniAudioPlayer';
import { ToastProvider } from './components/common/Toast';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'surah-list' | 'bookmarks' | 'settings' | 'reader'>('home');
  const [activeSurahNumber, setActiveSurahNumber] = useState<number>(1);
  const [targetAyatNumber, setTargetAyatNumber] = useState<number | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [lastRead, setLastRead] = useState<LastReadPosition | null>(db.getLastRead());

  const isOnline = useOnlineStatus();

  // Apply automatic brand theme from APP_CONFIG on initial render
  useEffect(() => {
    applyThemeTokens();
  }, []);

  // Update last read when switching back to home
  useEffect(() => {
    if (currentTab === 'home') {
      setLastRead(db.getLastRead());
      setSettings(db.getSettings());
    }
  }, [currentTab]);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenSurah = (nomor: number, targetAyat?: number) => {
    setActiveSurahNumber(nomor);
    setTargetAyatNumber(targetAyat);
    setCurrentTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateFromSearch = (nomorSurat: number, nomorAyat?: number) => {
    handleOpenSurah(nomorSurat, nomorAyat);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FAF9F4] text-[#24352B] flex flex-col font-latin selection:bg-[#126B50]/15 selection:text-[#126B50]">
        {/* Offline Banner if disconnected */}
        {!isOnline && (
          <aside
            aria-label="Status Jaringan"
            className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 sticky top-0 z-50 shadow-xs"
          >
            <WifiOff className="w-4 h-4" />
            <span>Mode Offline — Menampilkan surat yang telah tersimpan di cache.</span>
          </aside>
        )}

        {/* Global Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 pb-28 md:pb-16">
          {currentTab === 'home' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
              <HeroLastRead
                lastRead={lastRead}
                onContinueReading={(nomor, ayat) => handleOpenSurah(nomor, ayat)}
                onExploreSurah={() => setCurrentTab('surah-list')}
              />

              <TilawahTargetCard
                settings={settings}
                onOpenSettings={() => setCurrentTab('settings')}
              />

              <QuickAccess
                onSelectSurah={(nomor) => handleOpenSurah(nomor)}
                onOpenSurahList={() => setCurrentTab('surah-list')}
                onOpenBookmarks={() => setCurrentTab('bookmarks')}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenSettings={() => setCurrentTab('settings')}
              />

              {/* Infinite Logo Marquee: Didukung Oleh */}
              <PartnerLogoMarquee />
            </div>
          )}

          {currentTab === 'surah-list' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-4">
                <h1 className="text-base sm:text-lg font-bold text-[#24352B]">
                  Daftar 114 Surat Al-Qur'an
                </h1>
                <p className="text-xs text-[#576B60]">
                  Mushaf standar Kemenag RI lengkap dengan teks Arab berharakat, terjemahan, dan audio.
                </p>
              </div>
              <SurahList onSelectSurah={(nomor) => handleOpenSurah(nomor)} />
            </div>
          )}

          {currentTab === 'reader' && (
            <SurahReaderView
              nomorSurat={activeSurahNumber}
              targetAyat={targetAyatNumber}
              settings={settings}
              onBack={() => setCurrentTab('surah-list')}
              onNavigateSurah={(nomor, targetAyat) => {
                setActiveSurahNumber(nomor);
                setTargetAyatNumber(targetAyat);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentTab === 'bookmarks' && (
            <div className="animate-in fade-in duration-300">
              <BookmarkListView
                onNavigateToAyat={(nomorSurat, nomorAyat) =>
                  handleOpenSurah(nomorSurat, nomorAyat)
                }
                onExploreSurah={() => setCurrentTab('surah-list')}
              />
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="animate-in fade-in duration-300">
              <SettingsView
                settings={settings}
                onUpdateSettings={(newSettings) => setSettings(newSettings)}
              />
            </div>
          )}
        </main>

        {/* Floating Mini Audio Player */}
        <MiniAudioPlayer />

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigateToResult={handleNavigateFromSearch}
        />

        {/* Mobile Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      </div>
    </ToastProvider>
  );
}
