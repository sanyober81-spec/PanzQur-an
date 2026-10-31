/**
 * INPUT PESERTA — HANYA BAGIAN INI YANG BOLEH DIUBAH
 * Peserta hanya perlu mengubah appName dan primaryColor.
 * Seluruh branding, tema, metadata, dan semantic tokens dihasilkan secara otomatis.
 */
export const APP_CONFIG = {
  appName: "PanzQur'an",
  primaryColor: "#126B50"
} as const;

export type AppConfig = typeof APP_CONFIG;
