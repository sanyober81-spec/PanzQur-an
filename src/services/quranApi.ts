import { SurahListItem, SurahDetail, SurahTafsirData } from '../types/quran';
import { db } from '../storage/db';

const BASE_URL = 'https://equran.id/api/v2';
const DEFAULT_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

// In-flight request deduplication map
const pendingRequests = new Map<string, Promise<unknown>>();

// In-memory cache for fast tab switching
const memoryCache = {
  suratList: null as SurahListItem[] | null,
  suratDetails: new Map<number, SurahDetail>(),
  tafsirDetails: new Map<number, SurahTafsirData>(),
};

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  statusCode?: number;
  isOfflineFallback?: boolean;

  constructor(message: string, statusCode?: number, isOfflineFallback = false) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOfflineFallback = isOfflineFallback;
  }
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new ApiError(`Gagal mengambil data dari server (${response.status})`, response.status);
    }

    const json: ApiResponse<T> = await response.json();
    if (!json || json.code !== 200 || !json.data) {
      throw new ApiError(json?.message || 'Data Al-Qur\'an tidak valid atau kosong', json?.code);
    }

    return json.data;
  } catch (err: unknown) {
    clearTimeout(id);
    const error = err as Error;

    if (error.name === 'AbortError') {
      if (retries > 0) {
        console.warn(`[API] Timeout on ${url}. Retrying... (${retries} left)`);
        return fetchWithRetry<T>(url, options, retries - 1, timeoutMs);
      }
      throw new ApiError('Koneksi timeout saat menghubungi server eQuran. Periksa koneksi internet Anda.');
    }

    if (retries > 0) {
      console.warn(`[API] Fetch failed on ${url}: ${error.message}. Retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 800));
      return fetchWithRetry<T>(url, options, retries - 1, timeoutMs);
    }

    throw new ApiError(error.message || 'Terjadi kesalahan jaringan.');
  }
}

// Deduplicated fetch helper
function deduplicatedFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }
  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });
  pendingRequests.set(key, promise);
  return promise;
}

export const quranApi = {
  /**
   * Mengambil daftar seluruh 114 surat dari API v2
   */
  async getAllSurat(): Promise<SurahListItem[]> {
    if (memoryCache.suratList && memoryCache.suratList.length === 114) {
      return memoryCache.suratList;
    }

    return deduplicatedFetch('all_surat', async () => {
      try {
        const data = await fetchWithRetry<SurahListItem[]>(`${BASE_URL}/surat`);
        if (Array.isArray(data) && data.length > 0) {
          memoryCache.suratList = data;
          return data;
        }
        throw new ApiError('Daftar surat tidak lengkap.');
      } catch (err) {
        // Check if we have cached surahs to build an emergency fallback or propagate error
        throw err;
      }
    });
  },

  /**
   * Mengambil detail surat dan seluruh ayat berdasarkan nomor surat (1-114)
   */
  async getSuratDetail(nomor: number): Promise<{ data: SurahDetail; isFromCache: boolean }> {
    if (nomor < 1 || nomor > 114) {
      throw new ApiError(`Nomor surat tidak valid: ${nomor}. Surat Al-Qur'an bernomor 1 s.d 114.`);
    }

    // 1. Check in-memory
    if (memoryCache.suratDetails.has(nomor)) {
      return { data: memoryCache.suratDetails.get(nomor)!, isFromCache: true };
    }

    return deduplicatedFetch(`surat_${nomor}`, async () => {
      try {
        const data = await fetchWithRetry<SurahDetail>(`${BASE_URL}/surat/${nomor}`);
        // Store in memory and persistent cache
        memoryCache.suratDetails.set(nomor, data);
        db.cacheSurah(data);
        return { data, isFromCache: false };
      } catch (err) {
        // Fallback to local storage cache if network failed
        const cached = db.getCachedSurah(nomor);
        if (cached) {
          memoryCache.suratDetails.set(nomor, cached);
          return { data: cached, isFromCache: true };
        }
        throw err;
      }
    });
  },

  /**
   * Mengambil tafsir lengkap per ayat untuk surat tertentu
   */
  async getSuratTafsir(nomor: number): Promise<SurahTafsirData> {
    if (nomor < 1 || nomor > 114) {
      throw new ApiError(`Nomor surat tidak valid: ${nomor}`);
    }

    if (memoryCache.tafsirDetails.has(nomor)) {
      return memoryCache.tafsirDetails.get(nomor)!;
    }

    return deduplicatedFetch(`tafsir_${nomor}`, async () => {
      const data = await fetchWithRetry<SurahTafsirData>(`${BASE_URL}/tafsir/${nomor}`);
      memoryCache.tafsirDetails.set(nomor, data);
      return data;
    });
  },
};
