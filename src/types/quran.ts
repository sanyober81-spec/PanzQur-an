export interface AudioFullMap {
  '01'?: string;
  '02'?: string;
  '03'?: string;
  '04'?: string;
  '05'?: string;
  '06'?: string;
  [key: string]: string | undefined;
}

export interface SurahListItem {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: AudioFullMap;
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: AudioFullMap;
}

export interface SurahDetailNavigation {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}

export interface SurahDetail extends SurahListItem {
  ayat: Ayah[];
  suratSelanjutnya: SurahDetailNavigation | false;
  suratSebelumnya: SurahDetailNavigation | false;
}

export interface TafsirAyahItem {
  ayat: number;
  teks: string;
}

export interface SurahTafsirData {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: TafsirAyahItem[];
}

export interface Bookmark {
  id: string; // `${nomorSurat}:${nomorAyat}`
  nomorSurat: number;
  namaSuratLatin: string;
  nomorAyat: number;
  teksArab: string;
  teksIndonesia: string;
  timestamp: number;
  note?: string;
}

export interface LastReadPosition {
  nomorSurat: number;
  namaSuratLatin: string;
  nomorAyat: number;
  totalAyat: number;
  timestamp: number;
}

export type ArabicFontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type LatinFontSize = 'sm' | 'md' | 'lg';

export interface AppSettings {
  arabicFontSize: ArabicFontSize;
  latinFontSize: LatinFontSize;
  showTransliteration: boolean;
  showTranslation: boolean;
  selectedQari: string; // '01' | '02' | '03' | '04' | '05' | '06'
  dailyReadingTarget: number; // e.g. 10 ayat per day
  completedTodayAyatCount: number;
  lastTargetDate: string; // YYYY-MM-DD
}

export interface QariInfo {
  id: string;
  name: string;
  origin: string;
}

export const QARI_LIST: QariInfo[] = [
  { id: '01', name: 'Abdullah Al-Juhany', origin: 'Makkah' },
  { id: '02', name: 'Abdul-Muhsin Al-Qasim', origin: 'Madinah' },
  { id: '03', name: 'Abdurrahman as-Sudais', origin: 'Makkah' },
  { id: '04', name: 'Ibrahim Al-Dossari', origin: 'Saudi Arabia' },
  { id: '05', name: 'Misyari Rasyid Al-Afasi', origin: 'Kuwait' },
  { id: '06', name: 'Yasser Al-Dosari', origin: 'Makkah' },
];

export interface SearchResultItem {
  type: 'surah' | 'ayah';
  nomorSurat: number;
  namaSuratLatin: string;
  nomorAyat?: number;
  teksArab?: string;
  teksIndonesia?: string;
  snippet: string;
  matchField: 'nama' | 'arti' | 'terjemahan' | 'nomor';
}
