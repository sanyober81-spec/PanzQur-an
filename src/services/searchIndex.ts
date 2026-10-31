import { SurahListItem, SurahDetail, SearchResultItem } from '../types/quran';
import { quranApi } from './quranApi';
import { db } from '../storage/db';

interface IndexedAyah {
  nomorSurat: number;
  namaSuratLatin: string;
  nomorAyat: number;
  teksArab: string;
  teksIndonesia: string;
}

class SearchIndexService {
  private surahList: SurahListItem[] = [];
  private indexedAyahs: Map<string, IndexedAyah> = new Map(); // key: `${surat}:${ayat}`
  private indexedSurahNumbers: Set<number> = new Set();
  private isIndexingActive = false;
  private abortIndexing = false;
  private listeners: ((progress: { indexedSurahs: number; totalSurahs: number; indexedAyahs: number; isRunning: boolean }) => void)[] = [];

  constructor() {
    // Check cached surahs in storage to hydrate index immediately
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    try {
      const cachedNumbers = db.getCachedSurahNumbers();
      for (const num of cachedNumbers) {
        const surah = db.getCachedSurah(num);
        if (surah && surah.ayat) {
          this.indexSurahDirect(surah);
        }
      }
    } catch (err) {
      console.warn('[SearchIndex] Hydration error', err);
    }
  }

  public setSurahList(list: SurahListItem[]) {
    this.surahList = list;
    this.notify();
  }

  public subscribe(cb: (progress: { indexedSurahs: number; totalSurahs: number; indexedAyahs: number; isRunning: boolean }) => void) {
    this.listeners.push(cb);
    cb(this.getProgress());
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    const progress = this.getProgress();
    for (const l of this.listeners) {
      l(progress);
    }
  }

  public getProgress() {
    return {
      indexedSurahs: this.indexedSurahNumbers.size,
      totalSurahs: 114,
      indexedAyahs: this.indexedAyahs.size,
      isRunning: this.isIndexingActive,
    };
  }

  /**
   * Indeks langsung detail surat yang sudah dibuka oleh user
   */
  public indexSurahDirect(surah: SurahDetail) {
    if (!surah || !surah.ayat) return;
    for (const ayah of surah.ayat) {
      const key = `${surah.nomor}:${ayah.nomorAyat}`;
      this.indexedAyahs.set(key, {
        nomorSurat: surah.nomor,
        namaSuratLatin: surah.namaLatin,
        nomorAyat: ayah.nomorAyat,
        teksArab: ayah.teksArab,
        teksIndonesia: ayah.teksIndonesia,
      });
    }
    this.indexedSurahNumbers.add(surah.nomor);
    this.notify();
  }

  /**
   * Memulai pengindeksan latar belakang secara bertahap dan santun (tidak membanjiri API)
   */
  public async startProgressiveIndexing(batchSize = 5) {
    if (this.isIndexingActive) return;
    this.isIndexingActive = true;
    this.abortIndexing = false;
    this.notify();

    try {
      // Pastikan metadata surat tersedia
      if (this.surahList.length === 0) {
        this.surahList = await quranApi.getAllSurat();
      }

      // Prioritas surat yang sering dibaca terlebih dahulu
      const prioritySurahs = [1, 36, 18, 67, 56, 55, 2, 3, 4, 112, 113, 114];
      const allNumbers = Array.from({ length: 114 }, (_, i) => i + 1);
      const queue = [
        ...prioritySurahs.filter(n => !this.indexedSurahNumbers.has(n)),
        ...allNumbers.filter(n => !prioritySurahs.includes(n) && !this.indexedSurahNumbers.has(n)),
      ];

      for (let i = 0; i < queue.length; i += batchSize) {
        if (this.abortIndexing) break;

        const currentBatch = queue.slice(i, i + batchSize);
        await Promise.all(
          currentBatch.map(async (num) => {
            try {
              const res = await quranApi.getSuratDetail(num);
              this.indexSurahDirect(res.data);
            } catch (err) {
              console.warn(`[SearchIndex] Skip indexing surat ${num}:`, err);
            }
          })
        );

        // Beri jeda 800ms antar batch agar network dan CPU tetap tenang
        await new Promise(r => setTimeout(r, 800));
      }
    } catch (err) {
      console.warn('[SearchIndex] Error during indexing:', err);
    } finally {
      this.isIndexingActive = false;
      this.notify();
    }
  }

  public stopIndexing() {
    this.abortIndexing = true;
    this.isIndexingActive = false;
    this.notify();
  }

  /**
   * Menjalankan pencarian query multi-kategori: nomor surat, nama surat, nomor ayat, arti, atau frasa terjemahan
   */
  public search(query: string, maxResults = 50): SearchResultItem[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const results: SearchResultItem[] = [];

    // 1. Cek apakah query adalah nomor angka (misal "36" atau "1:5")
    if (/^\d+$/.test(cleanQuery)) {
      const num = parseInt(cleanQuery, 10);
      if (num >= 1 && num <= 114) {
        const found = this.surahList.find(s => s.nomor === num);
        if (found) {
          results.push({
            type: 'surah',
            nomorSurat: found.nomor,
            namaSuratLatin: found.namaLatin,
            snippet: `Surat ke-${found.nomor} · ${found.arti} (${found.jumlahAyat} Ayat)`,
            matchField: 'nomor',
          });
        }
      }
    } else if (cleanQuery.includes(':')) {
      const parts = cleanQuery.split(':');
      const sNum = parseInt(parts[0], 10);
      const aNum = parseInt(parts[1], 10);
      if (!isNaN(sNum) && !isNaN(aNum)) {
        const surah = this.surahList.find(s => s.nomor === sNum);
        if (surah && aNum <= surah.jumlahAyat) {
          const ayahKey = `${sNum}:${aNum}`;
          const ayah = this.indexedAyahs.get(ayahKey);
          results.push({
            type: 'ayah',
            nomorSurat: sNum,
            namaSuratLatin: surah.namaLatin,
            nomorAyat: aNum,
            teksArab: ayah?.teksArab,
            teksIndonesia: ayah?.teksIndonesia,
            snippet: ayah ? ayah.teksIndonesia : `Ayat ke-${aNum} dalam Surat ${surah.namaLatin}`,
            matchField: 'nomor',
          });
        }
      }
    }

    // 2. Cari di daftar surat (nama Latin, nama Arab, dan arti)
    for (const surah of this.surahList) {
      if (results.length >= maxResults) break;
      const matchLatin = surah.namaLatin.toLowerCase().includes(cleanQuery);
      const matchArti = surah.arti.toLowerCase().includes(cleanQuery);
      const matchArab = surah.nama.includes(query.trim());

      if (matchLatin || matchArti || matchArab) {
        // Jangan duplikasi jika sudah ditambahkan lewat nomor
        if (!results.some(r => r.type === 'surah' && r.nomorSurat === surah.nomor)) {
          results.push({
            type: 'surah',
            nomorSurat: surah.nomor,
            namaSuratLatin: surah.namaLatin,
            snippet: `Surat ke-${surah.nomor} · Arti: "${surah.arti}" · ${surah.tempatTurun} (${surah.jumlahAyat} Ayat)`,
            matchField: matchLatin ? 'nama' : 'arti',
          });
        }
      }
    }

    // 3. Cari di terjemahan dan teks ayat yang telah terindeks
    for (const [_, ayah] of this.indexedAyahs.entries()) {
      if (results.length >= maxResults) break;

      const indoLower = ayah.teksIndonesia.toLowerCase();
      const matchIndo = indoLower.includes(cleanQuery);
      const matchArab = ayah.teksArab.includes(query.trim());

      if (matchIndo || matchArab) {
        // Highlight snippet
        const idx = indoLower.indexOf(cleanQuery);
        let snippet = ayah.teksIndonesia;
        if (idx !== -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(ayah.teksIndonesia.length, idx + cleanQuery.length + 60);
          snippet = (start > 0 ? '...' : '') + ayah.teksIndonesia.substring(start, end) + (end < ayah.teksIndonesia.length ? '...' : '');
        }

        results.push({
          type: 'ayah',
          nomorSurat: ayah.nomorSurat,
          namaSuratLatin: ayah.namaSuratLatin,
          nomorAyat: ayah.nomorAyat,
          teksArab: ayah.teksArab,
          teksIndonesia: ayah.teksIndonesia,
          snippet,
          matchField: 'terjemahan',
        });
      }
    }

    return results;
  }
}

export const searchIndex = new SearchIndexService();
