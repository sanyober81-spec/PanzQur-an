import { Bookmark, LastReadPosition, AppSettings, SurahDetail } from '../types/quran';

const STORAGE_KEYS = {
  BOOKMARKS: 'equran_bookmarks_v1',
  LAST_READ: 'equran_last_read_v1',
  SETTINGS: 'equran_settings_v1',
  SURAH_CACHE_PREFIX: 'equran_surah_cache_',
  CACHE_INDEX: 'equran_cached_surah_list',
};

const DEFAULT_SETTINGS: AppSettings = {
  arabicFontSize: 'lg',
  latinFontSize: 'md',
  showTransliteration: true,
  showTranslation: true,
  selectedQari: '05', // Misyari Rasyid Al-Afasi
  dailyReadingTarget: 10,
  completedTodayAyatCount: 0,
  lastTargetDate: new Date().toISOString().split('T')[0],
};

// Safe storage wrapper handling quota limits, privacy mode, and parse errors
class StorageService {
  private isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__equran_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isAvailable()) return fallback;
    try {
      const data = window.localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch (err) {
      console.warn(`[Storage] Failed to read key: ${key}`, err);
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[Storage] Failed to write key: ${key}`, err);
      return false;
    }
  }

  // Bookmarks
  getBookmarks(): Bookmark[] {
    return this.getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  }

  saveBookmark(bookmark: Bookmark): boolean {
    const list = this.getBookmarks();
    const existingIndex = list.findIndex(b => b.id === bookmark.id);
    if (existingIndex >= 0) {
      list[existingIndex] = bookmark;
    } else {
      list.unshift(bookmark);
    }
    return this.setItem(STORAGE_KEYS.BOOKMARKS, list);
  }

  removeBookmark(id: string): boolean {
    const list = this.getBookmarks().filter(b => b.id !== id);
    return this.setItem(STORAGE_KEYS.BOOKMARKS, list);
  }

  isBookmarked(nomorSurat: number, nomorAyat: number): boolean {
    const id = `${nomorSurat}:${nomorAyat}`;
    return this.getBookmarks().some(b => b.id === id);
  }

  getBookmark(nomorSurat: number, nomorAyat: number): Bookmark | undefined {
    const id = `${nomorSurat}:${nomorAyat}`;
    return this.getBookmarks().find(b => b.id === id);
  }

  // Last Read
  private lastReadWriteTimeout: ReturnType<typeof setTimeout> | null = null;

  getLastRead(): LastReadPosition | null {
    return this.getItem<LastReadPosition | null>(STORAGE_KEYS.LAST_READ, null);
  }

  saveLastRead(position: LastReadPosition, throttle = true): void {
    if (this.lastReadWriteTimeout) {
      clearTimeout(this.lastReadWriteTimeout);
    }

    if (throttle) {
      this.lastReadWriteTimeout = setTimeout(() => {
        this.setItem(STORAGE_KEYS.LAST_READ, position);
      }, 500);
    } else {
      this.setItem(STORAGE_KEYS.LAST_READ, position);
    }
  }

  // Settings
  getSettings(): AppSettings {
    const saved = this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const today = new Date().toISOString().split('T')[0];
    // Reset daily count if date changed
    if (saved.lastTargetDate !== today) {
      saved.lastTargetDate = today;
      saved.completedTodayAyatCount = 0;
      this.saveSettings(saved);
    }
    return { ...DEFAULT_SETTINGS, ...saved };
  }

  saveSettings(settings: AppSettings): boolean {
    return this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  incrementTodayReadingProgress(): void {
    const current = this.getSettings();
    const today = new Date().toISOString().split('T')[0];
    if (current.lastTargetDate !== today) {
      current.lastTargetDate = today;
      current.completedTodayAyatCount = 1;
    } else {
      current.completedTodayAyatCount += 1;
    }
    this.saveSettings(current);
  }

  // Offline Surah Cache in localStorage
  getCachedSurah(nomor: number): SurahDetail | null {
    return this.getItem<SurahDetail | null>(`${STORAGE_KEYS.SURAH_CACHE_PREFIX}${nomor}`, null);
  }

  cacheSurah(surah: SurahDetail): void {
    this.setItem(`${STORAGE_KEYS.SURAH_CACHE_PREFIX}${surah.nomor}`, surah);
    // keep index of cached surahs
    const cachedList = this.getItem<number[]>(STORAGE_KEYS.CACHE_INDEX, []);
    if (!cachedList.includes(surah.nomor)) {
      cachedList.push(surah.nomor);
      this.setItem(STORAGE_KEYS.CACHE_INDEX, cachedList);
    }
  }

  getCachedSurahNumbers(): number[] {
    return this.getItem<number[]>(STORAGE_KEYS.CACHE_INDEX, []);
  }
}

export const db = new StorageService();
